// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Fix for Linux/WSL2 rendering issues (libEGL warning: egl: failed to create dri2 screen)
    // Disables hardware acceleration for WebKitGTK to avoid rendering artifacts in VMs
    if cfg!(target_os = "linux") {
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }
    thosts_lib::run()
}
