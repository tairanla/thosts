use std::fs;
use std::io::Write;
use std::process::{Command, Stdio};
use std::env;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_hosts_path() -> String {
    if cfg!(target_os = "windows") {
        "C:\\Windows\\System32\\drivers\\etc\\hosts".to_string()
    } else {
        "/etc/hosts".to_string()
    }
}

#[tauri::command]
fn read_hosts(path: &str) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_hosts(path: &str, content: &str) -> Result<(), String> {
    fs::write(path, content).map_err(|e| e.to_string())
}

/// Write hosts file with system authentication dialog
/// This will trigger the system's native authentication dialog:
/// - Windows: UAC (User Account Control) dialog
/// - Linux: polkit/pkexec dialog or sudo password prompt
/// - macOS: sudo password prompt or system authentication dialog
#[tauri::command]
async fn write_hosts_with_admin(path: String, content: String) -> Result<(), String> {
    if cfg!(target_os = "windows") {
        write_hosts_windows(&path, &content).await
    } else {
        write_hosts_unix(&path, &content).await
    }
}

async fn write_hosts_windows(path: &str, content: &str) -> Result<(), String> {
    // Create a temporary file with the content
    let temp_dir = env::temp_dir();
    let temp_path = temp_dir.join("thosts_hosts.tmp");
    
    // Write content to temp file
    fs::write(&temp_path, content)
        .map_err(|e| format!("Failed to create temp file: {}", e))?;

    // Create a PowerShell script that will copy the temp file to hosts location
    // We'll execute this with elevated privileges using Start-Process -Verb RunAs
    let script_content = format!(
        r#"
$tempPath = '{}'
$hostsPath = '{}'
try {{
    $content = Get-Content -Path $tempPath -Raw -ErrorAction Stop
    $content | Out-File -FilePath $hostsPath -Encoding ASCII -NoNewline -ErrorAction Stop
    Remove-Item -Path $tempPath -Force -ErrorAction SilentlyContinue
    exit 0
}} catch {{
    Write-Host $_.Exception.Message
    Remove-Item -Path $tempPath -Force -ErrorAction SilentlyContinue
    exit 1
}}
"#,
        temp_path.to_str().unwrap().replace('\\', "\\\\"),
        path.replace('\\', "\\\\")
    );

    // Create a temporary PowerShell script file
    let ps_script_path = temp_dir.join("thosts_write.ps1");
    let mut ps_file = fs::File::create(&ps_script_path)
        .map_err(|e| format!("Failed to create PowerShell script: {}", e))?;
    ps_file.write_all(script_content.as_bytes())
        .map_err(|e| format!("Failed to write PowerShell script: {}", e))?;
    drop(ps_file);

    // Execute PowerShell with elevation (this will trigger UAC dialog)
    // Use Start-Process with -Verb RunAs to request admin privileges
    let output = Command::new("powershell")
        .args([
            "-ExecutionPolicy", "Bypass",
            "-NoProfile",
            "-Command",
            &format!(
                "$proc = Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -NoProfile -File \"{}\"' -Verb RunAs -Wait -PassThru; exit $proc.ExitCode",
                ps_script_path.to_str().unwrap().replace('\\', "\\\\")
            )
        ])
        .output()
        .map_err(|e| format!("Failed to execute PowerShell: {}", e))?;

    // Clean up script file
    let _ = fs::remove_file(&ps_script_path);
    let _ = fs::remove_file(&temp_path);

    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        let error_msg = if !stderr.is_empty() { stderr } else { stdout };
        
        if error_msg.contains("canceled") 
            || error_msg.contains("denied") 
            || error_msg.contains("拒绝")
            || output.status.code() == Some(1223) { // ERROR_CANCELLED
            Err("User canceled authentication or permission denied".to_string())
        } else {
            Err(format!("Failed to write hosts file: {}", error_msg))
        }
    }
}

async fn write_hosts_unix(path: &str, content: &str) -> Result<(), String> {
    // Create a temporary file with the content
    let temp_path = format!("{}.tmp", path);
    fs::write(&temp_path, content)
        .map_err(|e| format!("Failed to create temp file: {}", e))?;

    // Execute the command in a blocking task with timeout to avoid infinite blocking
    let temp_path_clone = temp_path.clone();
    let path_clone = path.to_string();
    
    let result = tokio::time::timeout(
        std::time::Duration::from_secs(300), // 5 minutes timeout
        tokio::task::spawn_blocking(move || -> Result<(), String> {
        if cfg!(target_os = "linux") {
            // Try pkexec first (polkit - shows system authentication dialog)
            // pkexec is designed for GUI applications and will show a system dialog
            let pkexec_result = Command::new("pkexec")
                .args(["cp", &temp_path_clone, &path_clone])
                .stdin(Stdio::null())
                .stdout(Stdio::null())
                .stderr(Stdio::piped())
                .status();
            
            match pkexec_result {
                Ok(status) if status.success() => {
                    return Ok(());
                }
                Ok(status) => {
                    // pkexec failed, check if it was canceled
                    if let Some(code) = status.code() {
                        if code == 126 || code == 127 {
                            // pkexec not available or permission denied, try sudo
                        } else {
                            // User canceled or authentication failed
                            return Err("Authentication canceled or not authorized".to_string());
                        }
                    }
                }
                Err(_) => {
                    // pkexec not available, fall through to sudo
                }
            }
            
            // Fallback to sudo
            // Note: In WSL or non-GUI environments, sudo may not work properly
            // as it requires interactive TTY input. We'll try it but expect it may fail.
            let sudo_result = Command::new("sudo")
                .args(["-A", "cp", &temp_path_clone, &path_clone])
                .env("SUDO_ASKPASS", "/usr/bin/ssh-askpass")
                .stdin(Stdio::null())
                .stdout(Stdio::null())
                .stderr(Stdio::piped())
                .status();
            
            // If -A flag doesn't work (askpass not configured), try without it
            // This will attempt to use the default sudo behavior
            let sudo_result = if sudo_result.is_err() || sudo_result.as_ref().ok().and_then(|s| s.code()) == Some(1) {
                Command::new("sudo")
                    .args(["cp", &temp_path_clone, &path_clone])
                    .stdin(Stdio::inherit())
                    .stdout(Stdio::null())
                    .stderr(Stdio::piped())
                    .status()
            } else {
                sudo_result
            };
            
            match sudo_result {
                Ok(status) if status.success() => Ok(()),
                Ok(status) => {
                    if let Some(code) = status.code() {
                        if code == 1 {
                            Err("Authentication failed or canceled. Please ensure you have proper permissions or use pkexec.".to_string())
                        } else {
                            Err(format!("Command failed with exit code: {}", code))
                        }
                    } else {
                        Err("Command was terminated".to_string())
                    }
                }
                Err(e) => {
                    let err_str = e.to_string();
                    if err_str.contains("No such file") {
                        Err("sudo command not found. Please install sudo or use pkexec.".to_string())
                    } else if err_str.contains("Permission denied") {
                        Err("Permission denied. Please run with appropriate privileges.".to_string())
                    } else {
                        Err(format!("Failed to execute sudo: {}. In WSL or non-GUI environments, please use pkexec or run the application with appropriate privileges.", err_str))
                    }
                }
            }
        } else {
            // macOS: Use sudo
            // On macOS, sudo should work with system authentication dialog
            let sudo_result = Command::new("sudo")
                .args(["cp", &temp_path_clone, &path_clone])
                .stdin(Stdio::inherit())
                .stdout(Stdio::null())
                .stderr(Stdio::piped())
                .status();
            
            match sudo_result {
                Ok(status) if status.success() => Ok(()),
                Ok(status) => {
                    if let Some(code) = status.code() {
                        if code == 1 {
                            Err("Authentication failed or canceled".to_string())
                        } else {
                            Err(format!("Command failed with exit code: {}", code))
                        }
                    } else {
                        Err("Command was terminated".to_string())
                    }
                }
                Err(e) => {
                    Err(format!("Failed to execute sudo: {}", e))
                }
            }
        }
    })).await;

    // Clean up temp file
    let _ = fs::remove_file(&temp_path);

    match result {
        Ok(Ok(Ok(()))) => Ok(()),
        Ok(Ok(Err(e))) => Err(e),
        Ok(Err(e)) => Err(format!("Task execution error: {}", e)),
        Err(_) => Err("Operation timed out. The authentication dialog may not be responding. Please try again or ensure you have proper system permissions configured.".to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    use tauri::{
        Manager,
        menu::{Menu, MenuItem},
        tray::{TrayIconBuilder, TrayIconEvent, MouseButton, MouseButtonState},
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let app_handle = app.handle();
            
            // Get main window
            let main_window = app.get_webview_window("main").unwrap();

            // Set up window close event - hide instead of closing
            let main_window_clone = main_window.clone();
            main_window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    // Hide window, ignore errors if window is already being destroyed
                    let _ = main_window_clone.hide();
                }
            });

            // Create tray menu items
            let version_text = format!("Version {}", env!("CARGO_PKG_VERSION"));
            let version_item = MenuItem::with_id(app_handle, "version", version_text, false, None::<&str>)
                .map_err(|e| format!("Failed to create version menu item: {}", e))?;
            let quit_item = MenuItem::with_id(app_handle, "quit", "Quit", true, None::<&str>)
                .map_err(|e| format!("Failed to create quit menu item: {}", e))?;

            // Create tray menu
            let menu = Menu::with_items(app_handle, &[&version_item, &quit_item])
                .map_err(|e| format!("Failed to create tray menu: {}", e))?;

            // Create tray icon
            let icon = app_handle.default_window_icon().cloned();
            let _tray = TrayIconBuilder::new()
                .icon(icon.unwrap())
                .menu(&menu)
                .show_menu_on_left_click(false) // Don't show menu on left click
                .on_menu_event(move |app, event| {
                    match event.id.as_ref() {
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    match event {
                        TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        } => {
                            // Show window on left click
                            let app = tray.app_handle();
                            if let Some(window) = app.get_webview_window("main") {
                                // Safely operate on window, ignore errors if window is being destroyed
                                let _ = window.unminimize();
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        _ => {}
                    }
                })
                .build(app_handle)
                .map_err(|e| format!("Failed to create tray icon: {}", e))?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            get_hosts_path,
            read_hosts,
            write_hosts,
            write_hosts_with_admin
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
