// Test program to check drive detection

use cocofile_lib::file_scanner::get_all_drives;

fn main() {
    let drives = get_all_drives();

    println!("Detected drives:");
    for (i, drive) in drives.iter().enumerate() {
        println!("  [{}] {}", i + 1, drive);
    }

    println!("\nTotal: {} drives", drives.len());

    // Check if /mnt/c is included
    if drives.iter().any(|d| d.contains("/mnt/c")) {
        println!("✅ SUCCESS: /mnt/c is detected!");
    } else {
        println!("❌ FAIL: /mnt/c is NOT detected");
    }
}
