use std::fs;
use std::process::Command;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AdminCredentials {
    username: String,
    password: String,
}

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

#[tauri::command]
async fn write_hosts_with_admin(path: String, content: String, credentials: AdminCredentials) -> Result<(), String> {
    let result = if cfg!(target_os = "windows") {
        // Windows: Use PowerShell with elevation
        write_hosts_windows(&path, &content, &credentials).await
    } else {
        // Unix-like: Use sudo
        write_hosts_unix(&path, &content, &credentials).await
    };

    result
}

async fn write_hosts_windows(path: &str, content: &str, credentials: &AdminCredentials) -> Result<(), String> {
    // In WSL, we handle this as a Unix system
    // Create a temporary file with the content
    let temp_path = format!("{}.tmp", path);
    fs::write(&temp_path, content).map_err(|e| format!("Failed to create temp file: {}", e))?;

    // For WSL environment, we'll try using sudo which might work if the system supports it
    let script = format!(
        "echo '{}' | sudo -S cp '{}' '{}' && rm '{}'",
        credentials.password,
        temp_path,
        path,
        temp_path
    );

    let output = Command::new("sh")
        .args(["-c", &script])
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    if output.status.success() {
        Ok(())
    } else {
        // Clean up temp file if it still exists
        let _ = fs::remove_file(&temp_path);
        let stderr = String::from_utf8_lossy(&output.stderr);
        if stderr.contains("incorrect password") || stderr.contains("authentication failure") {
            Err("Invalid administrator credentials".to_string())
        } else {
            Err(format!("Failed to write hosts file with admin privileges: {}", stderr))
        }
    }
}

async fn write_hosts_unix(path: &str, content: &str, credentials: &AdminCredentials) -> Result<(), String> {
    // Create a temporary file with the content
    let temp_path = format!("{}.tmp", path);
    fs::write(&temp_path, content).map_err(|e| format!("Failed to create temp file: {}", e))?;

    // Use echo to pipe password and then use sudo to move the file
    let script = format!(
        "echo '{}' | sudo -S cp '{}' '{}' && rm '{}'",
        credentials.password,
        temp_path,
        path,
        temp_path
    );

    let output = Command::new("sh")
        .args(["-c", &script])
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    if output.status.success() {
        Ok(())
    } else {
        // Clean up temp file if it still exists
        let _ = fs::remove_file(&temp_path);
        let stderr = String::from_utf8_lossy(&output.stderr);
        if stderr.contains("incorrect password") || stderr.contains("authentication failure") {
            Err("Invalid administrator credentials".to_string())
        } else {
            Err(format!("Failed to write hosts file with admin privileges: {}", stderr))
        }
    }
}

#[tauri::command]
async fn validate_admin_credentials(credentials: AdminCredentials) -> Result<bool, String> {
    let result = if cfg!(target_os = "windows") {
        validate_windows_credentials(&credentials).await
    } else {
        validate_unix_credentials(&credentials).await
    };

    result
}

async fn validate_windows_credentials(_credentials: &AdminCredentials) -> Result<bool, String> {
    // In WSL, we can't validate Windows credentials directly
    // We'll skip validation and let the write operation handle it
    Ok(true)
}

async fn validate_unix_credentials(credentials: &AdminCredentials) -> Result<bool, String> {
    // For Unix-like systems, we'll validate by attempting a simple sudo command
    let script = format!(
        "echo '{}' | sudo -S whoami",
        credentials.password
    );

    let output = Command::new("sh")
        .args(["-c", &script])
        .output()
        .map_err(|e| format!("Failed to validate credentials: {}", e))?;

    Ok(output.status.success())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_hosts_path,
            read_hosts,
            write_hosts,
            write_hosts_with_admin,
            validate_admin_credentials
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
