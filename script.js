let currentQuestions = [];

// 1. 根據題號對應來源資料的複習指引
function getReviewSuggestion(qId) {
  if ((qId >= 1 && qId <= 181) || (qId >= 653 && qId <= 708)) {
    return "複習：工作項目 01：職業介紹與法規 [1-43]";
  } else if (qId >= 182 && qId <= 212) {
    return "複習：勞動基準法相關規定 [43-50]";
  } else if (qId >= 213 && qId <= 251) {
    return "複習：就業保險法相關規定 [50-57]";
  } else if (qId >= 861 && qId <= 973) {
    return "複習：工作項目 02：招募實務、行職業分類 [209-224]";
  } else if (qId >= 974 && qId <= 1162) {
    return "複習：工作項目 03：職涯諮詢理論與心理測驗 [244-288]";
  } else if (qId >= 1164 && qId <= 1255) {
    return "複習：共同科目 90006：職業安全衛生 [354-370]";
  } else if (qId >= 1256 && qId <= 1343) {
    return "複習：共同科目 90007：工作倫理、個資法 [289-315]";
  } else if (qId >= 1344 && qId <= 1443) {
    return "複習：共同科目 90008：環境保護與 3R 原則 [316-333]";
  } else if (qId >= 1444 && qId <= 1605) {
    return "複習：共同科目 90009：節能減碳與能效分級 [334-353]";
  }
  return "參考勞動力發展署最新題庫";
}

// 2. 初始化測驗：隨機抽取並更新練習次數
async function initQuiz() {
  const practiceEl = document.getElementById("practice-count");
  const container = document.getElementById("quiz-container");

  try {
    // ✅ 讀題庫
    const response = await fetch("./questions.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`questions.json 載入失敗：HTTP ${response.status}`);
    }

    const allQuestions = await response.json();
    if (!Array.isArray(allQuestions) || allQuestions.length === 0) {
      throw new Error("questions.json 格式不正確或題目為空（應為陣列）");
    }

    // ✅ 更新練習次數
    let count = Number(localStorage.getItem("practice_count") || 0);
    count += 1;
    localStorage.setItem("practice_count", String(count));
    practiceEl.innerText = `這是您的第 ${count} 次練習`;

    // ✅ 隨機抽 20 題
    currentQuestions = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, 20);

    // ✅ 清空後再渲染（避免重複）
    container.innerHTML = "";

   currentQuestions.forEach((q, index) => {
  const isMulti = Array.isArray(q.answer); // ✅ answer 是陣列就當複選

  const inputType = isMulti ? "checkbox" : "radio";
  const optionsHtml = (q.options || []).map((opt, i) =>
    `<label>
      <input type="${inputType}" name="q${index}" value="${i}">
      ${opt}
    </label><br>`
  ).join("");

  container.innerHTML += `
    <div class="question">
      <strong>(題號 ${q.id}) ${q.question}</strong><br>
      ${optionsHtml}
    </div>`;
});


  } catch (err) {
    console.error(err);
    practiceEl.innerText = "載入失敗：請確認 script.js / questions.json 路徑與檔名是否正確";
    container.innerHTML = `<div class="error-item">錯誤：${err.message}</div>`;
  }
}

// 3. 交卷邏輯（onclick 需要在全域）
function submitQuiz() {
  let score = 0;
  const errors = [];

  currentQuestions.forEach((q, index) => {
    const selected = document.querySelector(`input[name="q${index}"]:checked`);
    const userAnsIndex = selected ? Number(selected.value) : -1;

    if (userAnsIndex === q.answer) {
      score++;
    } else {
      errors.push({
        ...q,
        userAns: userAnsIndex === -1 ? "未作答" : q.options?.[userAnsIndex],
        correctAns: q.options?.[q.answer]
      });
    }
  });

  // 顯示結果報告
  document.getElementById("quiz-container").style.display = "none";
  document.getElementById("result").style.display = "block";
  document.getElementById("score-info").innerText = `您的分數：${score} / 20`;

  const errorList = document.getElementById("error-list");
  errorList.innerHTML = "<h3>錯誤題目分析：</h3>";

  if (errors.length === 0) {
    errorList.innerHTML += `<div class="error-item" style="color:#3c763d;background:#dff0d8;">恭喜！全部答對 🎉</div>`;
    return;
  }

  errors.forEach(err => {
    errorList.innerHTML += `
      <div class="error-item">
        <strong>題目：${err.question}</strong><br>
        您的答案：${err.userAns ?? "未作答"} | 正確答案：${err.correctAns}<br>
        <em>應看資料：${getReviewSuggestion(err.id)}</em>
      </div>
    `;
  });
}

// ✅ DOM ready 就初始化（比 window.onload 更穩）
window.addEventListener("DOMContentLoaded", initQuiz);

// ✅ 讓 inline onclick 一定找得到（保險）
window.submitQuiz = submitQuiz;
