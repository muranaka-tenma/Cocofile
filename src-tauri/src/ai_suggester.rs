// CocoFile - AI Tag Suggester Module
// Provides AI-powered tag suggestions using Ollama

use serde::{Deserialize, Serialize};
use std::time::Duration;

/// Ollama API のエンドポイント
const OLLAMA_ENDPOINT: &str = "http://localhost:11434/api/generate";

/// タイムアウト設定（30秒）
const REQUEST_TIMEOUT: Duration = Duration::from_secs(30);

/// Ollama API リクエスト
#[derive(Debug, Serialize)]
struct OllamaRequest {
    model: String,
    prompt: String,
    stream: bool,
}

/// Ollama API レスポンス
#[derive(Debug, Deserialize)]
struct OllamaResponse {
    response: String,
}

/// AI提案結果
#[derive(Debug, Serialize, Deserialize)]
pub struct AiSuggestionResult {
    pub tags: Vec<String>,
    pub model_used: String,
    pub success: bool,
    pub error: Option<String>,
}

/// Ollamaの接続状態
#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaStatus {
    pub available: bool,
    pub endpoint: String,
    pub error: Option<String>,
}

/// Ollamaの接続状態を確認
pub async fn check_ollama_status() -> OllamaStatus {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(5))
        .build()
        .unwrap_or_default();

    match client.get("http://localhost:11434/api/tags").send().await {
        Ok(response) => {
            if response.status().is_success() {
                OllamaStatus {
                    available: true,
                    endpoint: OLLAMA_ENDPOINT.to_string(),
                    error: None,
                }
            } else {
                OllamaStatus {
                    available: false,
                    endpoint: OLLAMA_ENDPOINT.to_string(),
                    error: Some(format!("HTTP status: {}", response.status())),
                }
            }
        }
        Err(e) => OllamaStatus {
            available: false,
            endpoint: OLLAMA_ENDPOINT.to_string(),
            error: Some(format!("Connection failed: {}", e)),
        },
    }
}

/// AIを使ってタグを提案
///
/// # Arguments
/// * `file_name` - ファイル名
/// * `file_type` - ファイル種別（pdf, excel, word, powerpoint）
/// * `content_preview` - ファイル内容のプレビュー（最初の1000文字程度）
/// * `model_name` - 使用するOllamaモデル名（デフォルト: llama3.2）
pub async fn suggest_tags_ai(
    file_name: String,
    file_type: String,
    content_preview: String,
    model_name: Option<String>,
) -> Result<AiSuggestionResult, String> {
    let model = model_name.unwrap_or_else(|| "llama3.2".to_string());

    // プロンプトを構築
    let prompt = build_tag_suggestion_prompt(&file_name, &file_type, &content_preview);

    // Ollamaに問い合わせ
    match query_ollama(&model, &prompt).await {
        Ok(response_text) => {
            // レスポンスからタグを抽出
            let tags = parse_tags_from_response(&response_text);

            if tags.is_empty() {
                Ok(AiSuggestionResult {
                    tags: vec![],
                    model_used: model,
                    success: false,
                    error: Some("AIが有効なタグを提案できませんでした".to_string()),
                })
            } else {
                Ok(AiSuggestionResult {
                    tags,
                    model_used: model,
                    success: true,
                    error: None,
                })
            }
        }
        Err(e) => Ok(AiSuggestionResult {
            tags: vec![],
            model_used: model,
            success: false,
            error: Some(e),
        }),
    }
}

/// プロンプトを構築
fn build_tag_suggestion_prompt(file_name: &str, file_type: &str, content_preview: &str) -> String {
    // 内容プレビューを最大1000文字に制限
    let preview = if content_preview.len() > 1000 {
        &content_preview[..1000]
    } else {
        content_preview
    };

    format!(
        r#"あなたはファイル管理アシスタントです。以下のファイルに適切なタグを日本語で5〜10個提案してください。

【ファイル情報】
- ファイル名: {}
- ファイル種別: {}
- 内容のプレビュー:
{}

【タグ提案の指針】
1. 会社名、プロジェクト名、部署名などの組織情報
2. 文書種別（報告書、請求書、見積書、契約書、プレゼン資料など）
3. 技術分野やトピック（プログラミング、マーケティング、財務など）
4. 時期や年度（2024年度、Q1、上半期など）
5. 重要度や状態（重要、下書き、完成、承認済みなど）

【回答フォーマット】
- 各タグを改行区切りで出力してください
- 余計な説明文は不要です
- タグのみを出力してください（例: タグ1\nタグ2\nタグ3）

タグ一覧:"#,
        file_name, file_type, preview
    )
}

/// Ollama APIに問い合わせ
async fn query_ollama(model: &str, prompt: &str) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(REQUEST_TIMEOUT)
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let request_body = OllamaRequest {
        model: model.to_string(),
        prompt: prompt.to_string(),
        stream: false,
    };

    let response = client
        .post(OLLAMA_ENDPOINT)
        .json(&request_body)
        .send()
        .await
        .map_err(|e| {
            if e.is_timeout() {
                "Ollama API request timed out (30 seconds)".to_string()
            } else if e.is_connect() {
                "Cannot connect to Ollama. Please ensure Ollama is running on localhost:11434"
                    .to_string()
            } else {
                format!("Ollama API request failed: {}", e)
            }
        })?;

    if !response.status().is_success() {
        return Err(format!("Ollama API returned error: {}", response.status()));
    }

    let ollama_response: OllamaResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Ollama response: {}", e))?;

    Ok(ollama_response.response)
}

/// レスポンステキストからタグを抽出
fn parse_tags_from_response(response_text: &str) -> Vec<String> {
    response_text
        .lines()
        .map(|line| line.trim())
        .filter(|line| !line.is_empty())
        .filter(|line| !line.starts_with('-') && !line.starts_with('*')) // リストマーカーを除外
        .map(|line| {
            // 先頭の番号やマーカーを削除（例: "1. タグ名" -> "タグ名"）
            let cleaned = line
                .trim_start_matches(|c: char| c.is_numeric() || c == '.' || c == '-' || c == '*')
                .trim();
            cleaned.to_string()
        })
        .filter(|tag| !tag.is_empty() && tag.len() <= 50) // 空文字と長すぎるタグを除外
        .take(10) // 最大10個
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_tags_from_response() {
        let response = r#"会社名ABC
プロジェクトX
2024年度
見積書
重要
財務部
営業資料
Q1
承認済み
完成"#;

        let tags = parse_tags_from_response(response);
        assert_eq!(tags.len(), 10);
        assert_eq!(tags[0], "会社名ABC");
        assert_eq!(tags[1], "プロジェクトX");
    }

    #[test]
    fn test_parse_tags_with_markers() {
        let response = r#"1. 会社名ABC
2. プロジェクトX
3. 2024年度
- 見積書
* 重要"#;

        let tags = parse_tags_from_response(response);
        assert!(tags.len() >= 3);
        assert_eq!(tags[0], "会社名ABC");
    }

    #[test]
    fn test_build_tag_suggestion_prompt() {
        let prompt = build_tag_suggestion_prompt(
            "見積書_2024.pdf",
            "pdf",
            "株式会社ABC御中\n見積書\n合計: 100,000円",
        );

        assert!(prompt.contains("見積書_2024.pdf"));
        assert!(prompt.contains("pdf"));
        assert!(prompt.contains("株式会社ABC"));
    }
}
