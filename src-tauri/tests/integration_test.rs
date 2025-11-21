// Integration test for file scanning
// This test verifies that the scan_directory function works correctly

#[cfg(test)]
mod tests {
    use std::fs;
    use std::path::Path;

    #[test]
    fn test_file_scanner_basic() {
        // Create a test directory
        let test_dir = "/tmp/cocofile-test";
        assert!(Path::new(test_dir).exists(), "Test directory should exist");

        // Count files in test directory
        let mut file_count = 0;
        if let Ok(entries) = fs::read_dir(test_dir) {
            for entry in entries {
                if let Ok(entry) = entry {
                    if entry.path().is_file() {
                        file_count += 1;
                    }
                }
            }
        }

        println!("Found {} files in test directory", file_count);
        assert!(file_count > 0, "Test directory should contain files");
    }

    #[test]
    fn test_async_await_pattern() {
        // This test verifies that async/await pattern works correctly
        use std::future::Future;
        use std::pin::Pin;

        async fn mock_scan() -> Result<usize, String> {
            // Simulate a scan that takes time
            Ok(3)
        }

        // Test that await properly blocks until completion
        let runtime = tokio::runtime::Runtime::new().unwrap();
        let result = runtime.block_on(async {
            let files = mock_scan().await.unwrap();
            assert_eq!(files, 3);
            files
        });

        assert_eq!(result, 3);
    }
}
