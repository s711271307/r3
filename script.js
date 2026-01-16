<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <title>就業服務乙級模擬測驗 - 完整分析版</title>
    <style>
        body { font-family: "Microsoft JhengHei", Arial, sans-serif; max-width: 900px; margin: auto; padding: 20px; line-height: 1.6; background-color: #f4f7f6; }
        .question-box { background: white; margin-bottom: 20px; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .correct-card { border-left: 10px solid #5cb85c; background-color: #f9fff9; margin-bottom: 15px; padding: 15px; border-radius: 5px; }
        .error-card { border-left: 10px solid #d9534f; background-color: #fff9f9; margin-bottom: 15px; padding: 15px; border-radius: 5px; }
        .ans-label { font-weight: bold; color: #333; }
        .correct-ans { color: #5cb85c; font-weight: bold; }
        .wrong-ans { color: #d9534f; text-decoration: line-through; }
        .suggestion { font-style: italic; color: #666; font-size: 0.9em; margin-top: 5px; }
        button { padding: 12px 25px; background-color: #0275d8; color: white; border: none; cursor: pointer; border-radius: 5px; font-size: 16px; }
        #result-area { display: none; margin-top: 30px; }
        h1 { color: #2c3e50; }
    </style>
</head>
<body>
    <h1>就業服務乙級 - 隨機 20 題模擬測驗</h1>
    <p id="practice-count">載入中...</p>
    
    <div id="quiz-container"></div>
    <button id="submit-btn" onclick="submitQuiz()">交卷並查看詳細分析</button>

    <div id="result-area">
        <h2 id="score-info"></h2>
        <div id="analysis-list"></div>
        <button onclick="location.reload()">開始下一次練習</button>
    </div>

    <script src="script.js"></script>
</body>
</html>
2. script.js (邏輯更新：對錯題目並列與正解標示)
此版本強化了對複選題的支援（題號 1120-1162），並會根據題號精準對應來源手冊中的章節 [1, p.296-308]。
let currentQuestions = [];

// 1. 根據題號精確對應題庫來源
function getReviewSuggestion(qId) {
    if (qId >= 1 && qId <= 181 || (qId >= 653 && qId <= 708)) return "工作項目 01：職業介紹、外國人聘僱管理 [來源 p.1-157]";
    if (qId >= 182 && qId <= 212 || (qId >= 709 && qId <= 717)) return "勞動基準法及其施行細則 [來源 p.47-53, 175-178]";
    if (qId >= 213 && qId <= 251 || (qId >= 718 && qId <= 742)) return "就業保險法、就業促進津貼實施辦法 [來源 p.54-63, 178-186]";
    if (qId >= 861 && qId <= 973) return "工作項目 02：招募實務、行職業分類標準 [來源 p.219-263]";
    if (qId >= 974 && qId <= 1162) return "工作項目 03：職涯諮詢輔導、生涯理論與心理測驗 [來源 p.263-308]";
    if (qId >= 1164 && qId <= 1255) return "共同科目 90006：職業安全衛生相關法令 [來源 p.374-390]";
    if (qId >= 1256 && qId <= 1343) return "共同科目 90007：工作倫理、個資法、性別平等 [來源 p.309-335]";
    if (qId >= 1344 && qId <= 1443) return "共同科目 90008：環境保護與資源回收 [來源 p.336-353]";
    if (qId >= 1444 && qId <= 1605) return "共同科目 90009：節能減碳與能源管理 [來源 p.354-373]";
    return "勞動力發展署 19500 官方題庫";
}

// 2. 測驗初始化
async function initQuiz() {
    try {
        const response = await fetch('questions.json');
        const allQuestions = await response.json();
        
        let count = localStorage.getItem('job_practice_count') || 0;
        count = parseInt(count) + 1;
        localStorage.setItem('job_practice_count', count);
        document.getElementById('practice-count').innerText = `這是您的第 ${count} 次練習（隨機從 1,605 題中抽選）`;

        currentQuestions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 20);
        
        const container = document.getElementById('quiz-container');
        currentQuestions.forEach((q, index) => {
            const inputType = Array.isArray(q.answer) ? 'checkbox' : 'radio';
            let optionsHtml = q.options.map((opt, i) => 
                `<label><input type="${inputType}" name="q${index}" value="${i}"> ${opt}</label><br>`
            ).join('');
            
            container.innerHTML += `
                <div class="question-box">
                    <strong>${index + 1}. [題號 ${q.id}] ${q.question}</strong><br>
                    <div style="margin-top: 10px;">${optionsHtml}</div>
                </div>`;
        });
    } catch (err) {
        document.getElementById('practice-count').innerText = "題庫載入失敗，請檢查 questions.json 格式。";
    }
}

// 3. 交卷與詳細結果分析
function submitQuiz() {
    let score = 0;
    const analysisList = document.getElementById('analysis-list');
    analysisList.innerHTML = ""; // 清空舊內容

    currentQuestions.forEach((q, index) => {
        const selectedElements = document.querySelectorAll(`input[name="q${index}"]:checked`);
        const userAnswers = Array.from(selectedElements).map(el => parseInt(el.value));
        
        let isCorrect = false;
        if (Array.isArray(q.answer)) {
            isCorrect = JSON.stringify(userAnswers.sort()) === JSON.stringify(q.answer.sort());
        } else {
            isCorrect = userAnswers.length === 1 && userAnswers === q.answer;
        }

        const cardClass = isCorrect ? "correct-card" : "error-card";
        const statusText = isCorrect ? "【正確】" : "【錯誤】";
        
        // 格式化正確答案文字
        const correctText = Array.isArray(q.answer) 
            ? q.answer.map(i => q.options[i]).join('、') 
            : q.options[q.answer];

        const userText = userAnswers.length > 0 
            ? userAnswers.map(i => q.options[i]).join('、') 
            : "未作答";

        if (isCorrect) score++;

        analysisList.innerHTML += `
            <div class="${cardClass}">
                <strong>${statusText} 題號 ${q.id}：${q.question}</strong><br>
                <span class="ans-label">您的答案：</span> <span class="${isCorrect ? '' : 'wrong-ans'}">${userText}</span><br>
                ${!isCorrect ? `<span class="ans-label">正確答案：</span> <span class="correct-ans">${correctText}</span><br>` : ''}
                <div class="suggestion">建議指引：${getReviewSuggestion(q.id)}</div>
            </div>`;
    });

    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('submit-btn').style.display = 'none';
    document.getElementById('result-area').style.display = 'block';
    document.getElementById('score-info').innerText = `本次練習得分：${score * 5} 分 (答對 ${score} / 20 題)`;
    window.scrollTo(0, 0);
}

window.onload = initQuiz;
