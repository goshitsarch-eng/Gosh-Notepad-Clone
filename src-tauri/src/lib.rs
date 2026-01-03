use serde::{Deserialize, Serialize};
use std::fs;
use tauri::{AppHandle, WebviewWindow};
use tauri_plugin_dialog::DialogExt;

#[derive(Serialize, Deserialize)]
pub struct FileResult {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[tauri::command]
fn new_file() -> FileResult {
    FileResult {
        success: true,
        path: None,
        content: None,
        error: None,
    }
}

#[tauri::command]
async fn open_file(window: WebviewWindow) -> FileResult {
    let file_path = window
        .dialog()
        .file()
        .add_filter("Text Documents", &["txt"])
        .add_filter("All Files", &["*"])
        .blocking_pick_file();

    match file_path {
        Some(file_path) => match file_path.into_path() {
            Ok(path_buf) => {
                let path_str = path_buf.to_string_lossy().to_string();
                match fs::read_to_string(&path_buf) {
                    Ok(content) => FileResult {
                        success: true,
                        path: Some(path_str),
                        content: Some(content),
                        error: None,
                    },
                    Err(e) => FileResult {
                        success: false,
                        path: None,
                        content: None,
                        error: Some(e.to_string()),
                    },
                }
            }
            Err(e) => FileResult {
                success: false,
                path: None,
                content: None,
                error: Some(e.to_string()),
            },
        },
        None => FileResult {
            success: false,
            path: None,
            content: None,
            error: None,
        },
    }
}

#[tauri::command]
fn save_file(path: String, content: String) -> FileResult {
    match fs::write(&path, &content) {
        Ok(_) => FileResult {
            success: true,
            path: Some(path),
            content: None,
            error: None,
        },
        Err(e) => FileResult {
            success: false,
            path: None,
            content: None,
            error: Some(e.to_string()),
        },
    }
}

#[tauri::command]
async fn save_file_as(window: WebviewWindow, content: String) -> FileResult {
    let file_path = window
        .dialog()
        .file()
        .add_filter("Text Documents", &["txt"])
        .add_filter("All Files", &["*"])
        .set_file_name("Untitled.txt")
        .blocking_save_file();

    match file_path {
        Some(file_path) => match file_path.into_path() {
            Ok(path_buf) => {
                let path_str = path_buf.to_string_lossy().to_string();
                match fs::write(&path_buf, &content) {
                    Ok(_) => FileResult {
                        success: true,
                        path: Some(path_str),
                        content: None,
                        error: None,
                    },
                    Err(e) => FileResult {
                        success: false,
                        path: None,
                        content: None,
                        error: Some(e.to_string()),
                    },
                }
            }
            Err(e) => FileResult {
                success: false,
                path: None,
                content: None,
                error: Some(e.to_string()),
            },
        },
        None => FileResult {
            success: false,
            path: None,
            content: None,
            error: None,
        },
    }
}

#[tauri::command]
fn print_document(window: WebviewWindow) -> Result<(), String> {
    window
        .eval("window.print()")
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn set_window_title(window: WebviewWindow, title: String) -> Result<(), String> {
    window
        .set_title(&title)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn quit_app(app: AppHandle) {
    app.exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            new_file,
            open_file,
            save_file,
            save_file_as,
            print_document,
            set_window_title,
            quit_app,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
