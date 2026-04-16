# 語音演講稿產製 Web App - PRD

## 一、產品目標
開發一個網頁應用程式，使用者可以輸入素材內容，透過 Gemini API 自動生成單人或雙人的演講稿，並將其轉換為語音檔，提供播放或下載功能。

---

## 二、使用模型
- 演講稿生成：`gemini-3-flash-preview`
- 語音合成：`gemini-3.1-flash-tts-preview`

---

## 三、功能模組

### 1. 素材輸入介面
- 提供輸入框輸入文字素材
- 支援最大輸入限制（如需可設定）

### 2. 設定區
- 演講形式選擇：
  - `單人`
  - `雙人`
- 語音選擇下拉選單（依據演講形式限制可選數量）
  - 可選語音：
    - Zephyr、Puck、Charon、Kore、Fenrir、Leda、Orus、Aoede、Callirrhoe、Autonoe、Enceladus、Iapetus、Umbriel、Algieba、Despina、Erinome、Algenib、Rasalgethi、Laomedeia、Achernar、Alnilam、Schedar、Gacrux、Pulcherrima、Achird、Zubenelgenubi、Vindemiatrix、Sadachbia、Sadaltager、Sulafat

### 3. 輸出演講稿
- 使用 `gemini-3-flash-preview` 將素材轉換為演講腳本
  - 單人格式：符合 TTS 單語者輸出規格
  - 雙人格式：符合對話腳本格式
  - 提示語與 prompt 可由前端組裝或後端控制

### 4. 語音合成與回傳
- 使用 `gemini-3.1-flash-tts-preview` 呼叫語音模型產出語音檔

#### 單人語音範例
```
"contents": [{
  "parts": [{
    "text": "Say cheerfully: Have a wonderful day!"
  }]
}],
"generationConfig": {
  "responseModalities": ["AUDIO"],
  "speechConfig": {
    "voiceConfig": {
      "prebuiltVoiceConfig": {
        "voiceName": "Kore"
      }
    }
  }
}
```

#### 雙人語音範例
```
"contents": [{
  "parts": [{
    "text": "TTS the following conversation between Kore and Puck: \nKore: How's it going today Jane?\nPuck: Not too bad, how about you?"
  }]
}],
"generationConfig": {
  "responseModalities": ["AUDIO"],
  "speechConfig": {
    "multiSpeakerVoiceConfig": {
      "speakerVoiceConfigs": [{
        "speaker": "Kore",
        "voiceConfig": {
          "prebuiltVoiceConfig": {
            "voiceName": "Kore"
          }
        }
      }, {
        "speaker": "Puck",
        "voiceConfig": {
          "prebuiltVoiceConfig": {
            "voiceName": "Puck"
          }
        }
      }]
    }
  }
}
```

### 5. 音檔播放或下載
- 產出語音檔後提供：
  - 線上播放按鈕
  - 音檔下載連結（支援 mp3/wav）

---

## 四、備註
- 須自行處理 Gemini API 認證與金鑰管理
- 若使用 Base64 格式回傳，需轉檔並回傳可播放音訊格式