// ວາງຄຳຕອບທີ່ຖືກຕ້ອງໄວ້ບ່ອນດຽວ ເພື່ອໃຫ້ທັງສອງຟັງຊັນເອີ້ນໃຊ້ໄດ້
const correctAnswers = {
    q1: 'b',
    q2: 'a',
    q3: 'c',
    q4: 'CPU',
    q5: 'c',
    q6: 'a',
    q7: "I want to apologize for every time I made you sad or disappointed. Today, I realize that my success in every step comes from your support and blessings. Finally, nothing is more valuable than the word \"Thank you\". I promise to be a good person, to build a good future to repay your kindness, and to make you smile and be proud forever. I wish you good health and to stay with us for a long time."
};

function checkAnswers() {
    // ຍ້າຍໂຕແປທີ່ສຳຄັນມາໄວ້ເທິງສຸດ
    const form = document.getElementById('quizForm');
    const resultDiv = document.getElementById('result');
    const studentName = document.getElementById('studentName').value;
    let score = 0;
    // ຈຳນວນຄຳຖາມທັງໝົດແມ່ນເທົ່າກັບຈຳນວນຄຳຕອບທີ່ກຽມໄວ້
    const totalQuestions = 10; // ຄະແນນເຕັມ 10

    if (studentName.trim() === "") {
        alert("ກະລຸນາໃສ່ຊື່ນັກຮຽນກ່ອນສົ່ງບົດສອບເສັງ!");
        return;
    }

    // ກວດສອບວ່າຊື່ນີ້ເຄີຍສົ່ງແລ້ວຫຼືບໍ່ (Check LocalStorage)
    if (localStorage.getItem('submitted_' + studentName.trim())) {
        alert("ຊື່ນີ້ (" + studentName.trim() + ") ໄດ້ສົ່ງບົດສອບເສັງໄປແລ້ວ! ບໍ່ສາມາດສົ່ງຊ້ຳໄດ້.");
        return;
    }

    // ວິທີກວດຄຳຕອບແບບໃໝ່ທີ່ຮັດກຸມກວ່າ
    // ໃຊ້ FormData ເພື່ອດຶງຄ່າຈາກຟອມໄດ້ງ່າຍ (ໃຊ້ໄດ້ທັງ radio, text, textarea)
    const formData = new FormData(form);

    // 1. ຄິດໄລ່ຄະແນນພາກປາລະໄນ (ຂໍ້ 1-6) ລວມ 5 ຄະແນນ
    let part1Score = 0;
    const part1Questions = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
    const scorePerQuestion = 5 / part1Questions.length;

    part1Questions.forEach(key => {
        const userAnswer = formData.get(key);
        if (userAnswer) {
            const uVal = userAnswer.trim().toLowerCase().replace(/\s+/g, ' ');
            const cVal = correctAnswers[key].trim().toLowerCase().replace(/\s+/g, ' ');
            if (uVal === cVal) {
                part1Score += scorePerQuestion;
            }
        }
    });

    // 2. ຄິດໄລ່ຄະແນນພາກພິມດິດ (ຂໍ້ 7) ລວມ 5 ຄະແນນ (ຕາມຄວາມຖືກຕ້ອງ)
    let part2Score = 0;
    const q7User = formData.get('q7') || "";
    const q7Correct = correctAnswers['q7'];
    let matchCount = 0;
    for (let i = 0; i < q7Correct.length; i++) {
        if (q7User[i] === q7Correct[i]) matchCount++;
    }
    part2Score = (matchCount / q7Correct.length) * 5;

    // ລວມຄະແນນ ແລະ ປັດເສດ (1.4 -> 1, 1.5 -> 2)
    score = Math.round(part1Score + part2Score);

    // ສະແດງຄະແນນດິບ ໂດຍບໍ່ຕ້ອງທຽບ
    document.getElementById('scoreDisplay').innerText = score;

    resultDiv.style.display = "block";
    // ປັບເງື່ອນໄຂຄະແນນຜ່ານ (ຕົວຢ່າງ: 50% ຂຶ້ນໄປ)
    if (score >= totalQuestions / 2) {
        resultDiv.style.backgroundColor = "#d4edda";
        resultDiv.style.color = "#155724";
        resultDiv.innerHTML = `ເກັ່ງຫຼາຍ ${studentName}! <br> ຄະແນນຂອງເຈົ້າແມ່ນ: ${score} / ${totalQuestions}`;
    } else {
        resultDiv.style.backgroundColor = "#f8d7da";
        resultDiv.style.color = "#721c24";
        resultDiv.innerHTML = `ພະຍາຍາມຕື່ມອີກເດີ້ ${studentName}! <br> ຄະແນນຂອງເຈົ້າແມ່ນ: ${score} / ${totalQuestions}`;
    }

    resultDiv.scrollIntoView({ behavior: "smooth" });

    // ສົ່ງຄະແນນ ແລະ ຄະແນນເຕັມໄປນຳ ເພື່ອສະແດງໃນ PDF
    generateAndUploadPDF(studentName, score, totalQuestions);
}

function generateAndUploadPDF(studentName, score, totalQuestions) {
    const originalElement = document.querySelector(".container");
    const resultDiv = document.getElementById('result');

    resultDiv.innerHTML += "<p style='color:blue'>ກຳລັງສ້າງ PDF...</p>";

    // 1. Clone ແລະ ໃສ່ Class
    const clone = originalElement.cloneNode(true);
    clone.classList.add('pdf-mode');
    
    // ແກ້ໄຂບັນຫາ: ລຶບຮູບອອກຈາກ PDF ຊົ່ວຄາວ ເພາະການເປີດໄຟລ໌ໃນເຄື່ອງ (Local) ມັກມີບັນຫາກັບຮູບພາບ
    // ຖ້າບໍ່ລຶບອອກ ມັນຈະຄ້າງຢູ່ໜ້ານີ້ ແລະ ບໍ່ຍອມສ້າງ PDF
    const images = clone.querySelectorAll('img');
    images.forEach(img => img.remove());

    // 2. ດຶງຂໍ້ມູນ ແລະ ສະແດງຄະແນນໃນ PDF
    clone.querySelector('#studentName').value = document.getElementById('studentName').value;
    clone.querySelector('#scoreDisplay').innerText = `${score} / ${totalQuestions}`;

    // ເພີ່ມຄຳເຫັນຂອງຄູອັດຕະໂນມັດຕາມຄະແນນ (ເຕັມ 10)
    let comment = "";
    if (score >= 9) {
        comment = "ດີເລີດ! ຊົມເຊີຍ.";
    } else if (score >= 7) {
        comment = "ດີຫຼາຍ.";
    } else if (score >= 5) {
        comment = "ປານກາງ, ຄວນພະຍາຍາມຕື່ມ.";
    } else {
        comment = "ຄວນປັບປຸງ, ຕ້ອງທົບທວນບົດຮຽນຄືນ.";
    }
    clone.querySelector('#teacherComment').innerText = comment;

    // ຄັດລອກຄຳຕອບທີ່ຜູ້ໃຊ້ເລືອກ/ພິມ ໄປໃສ່ໃນ clone ເພື່ອໃຫ້ສະແດງຜົນໃນ PDF ໄດ້ຖືກຕ້ອງ
    const formElements = document.getElementById('quizForm').elements;
    for (const originalEl of formElements) {
        if (originalEl.name) {
            if (originalEl.type === 'radio') {
                if (originalEl.checked) {
                    const cloneRadio = clone.querySelector(`input[name="${originalEl.name}"][value="${originalEl.value}"]`);
                    if (cloneRadio) cloneRadio.checked = true;
                }
            } else if (originalEl.type === 'textarea' || originalEl.type === 'text') {
                const cloneEl = clone.querySelector(`[name="${originalEl.name}"]`);
                if (cloneEl) cloneEl.value = originalEl.value;
            }
        }
    }

    // ກວດສອບຄຳຕອບ ແລະ ໃສ່ສີ (ຖືກ = ຂຽວ, ຜິດ = ແດງ)
    // ໃຊ້ correctAnswers ໂຕດຽວກັນກັບ checkAnswers
    const formData = new FormData(document.getElementById('quizForm'));

    for (const key in correctAnswers) {
        const userAnswer = formData.get(key) || ""; // ຖ້າບໍ່ມີຄຳຕອບໃຫ້ເປັນ string ວ່າງ
        const correctAnswer = correctAnswers[key];
        const questionElements = clone.querySelectorAll(`[name="${key}"]`);
        const questionContainer = clone.querySelector(`[name="${key}"]`).closest('.question');

        // 1. ກວດສອບຂໍ້ທີ່ບໍ່ໄດ້ຕອບ (Unanswered) -> ໃສ່ພື້ນຫຼັງສີແດງ
        if (!userAnswer.trim()) {
            if (questionContainer) {
                questionContainer.style.backgroundColor = '#ffebee'; // ສີແດງອ່ອນ
                questionContainer.style.border = '1px solid #ffcdd2';
                // ເພີ່ມຂໍ້ຄວາມແຈ້ງເຕືອນ
                const msg = document.createElement('div');
                msg.innerText = "(ຍັງບໍ່ໄດ້ຕອບ)";
                msg.style.color = "red";
                msg.style.fontSize = "11px";
                msg.style.fontWeight = "bold";
                questionContainer.appendChild(msg);
            }
        }

        // 2. ຈັດການພາກພິມດິດ (ຂໍ້ 7) -> ສະແດງ Diff (ຖືກສີຂຽວ, ຜິດສີແດງ)
        if (key === 'q7') {
            const textarea = clone.querySelector(`textarea[name="${key}"]`);
            const questionContainer = textarea ? textarea.closest('.question') : null;
            // ຄົ້ນຫາກ່ອງຂໍ້ຄວາມຕົ້ນສະບັບ (div ທີ່ຢູ່ກ່ອນໜ້າ textarea)
            const referenceDiv = questionContainer ? questionContainer.querySelector('div') : null;

            if (referenceDiv) {
                // ປັບ Style ໃຫ້ຮອງຮັບການສະແດງຜົນແບບ Diff
                referenceDiv.style.whiteSpace = "pre-wrap"; 
                referenceDiv.style.wordBreak = "break-word";
                
                let diffHtml = "";
                const maxLen = Math.max(userAnswer.length, correctAnswer.length);
                
                for (let i = 0; i < maxLen; i++) {
                    const u = userAnswer[i];
                    const c = correctAnswer[i];
                    if (u === c) {
                        diffHtml += `<span style="color:green;">${u}</span>`;
                    } else if (u !== undefined) {
                        // ພິມຜິດ (ສະແດງຕົວທີ່ພິມມາເປັນສີແດງ)
                        diffHtml += `<span style="color:red; background-color:#ffebee;">${u}</span>`;
                    } else {
                        // ພິມບໍ່ຄົບ (ສະແດງຕົວທີ່ຂາດໄປເປັນສີບົວ)
                        diffHtml += `<span style="color:#ff69b4;">${c}</span>`;
                    }
                }
                // ອັບເດດເນື້ອຫາໃນກ່ອງຂໍ້ຄວາມຕົ້ນສະບັບແທນ
                referenceDiv.innerHTML = diffHtml;
            }
            continue; // ຂ້າມໄປ loop ຕໍ່ໄປ ເພາະຈັດການ q7 ແລ້ວ
        }

        if (questionElements.length > 1) { // ກໍລະນີ Radio buttons
            questionElements.forEach(radio => {
                const label = radio.parentElement;
                // ໃສ່ສີແດງໃຫ້ຄຳຕອບທີ່ຜູ້ໃຊ້ເລືອກ ແຕ່ມັນຜິດ
                if (radio.checked && radio.value.toLowerCase() !== correctAnswer.toLowerCase()) {
                    label.style.backgroundColor = '#f8d7da'; // ສີແດງອ່ອນ
                    label.style.border = '1px solid #f5c6cb';
                    label.style.borderRadius = '5px';
                }
                // ໃສ່ສີຂຽວໃຫ້ຄຳຕອບທີ່ຖືກສະເໝີ (ເພື່ອໃຫ້ຜູ້ໃຊ້ເຫັນຄຳຕອບທີ່ຖືກຕ້ອງ)
                if (radio.value.toLowerCase() === correctAnswer.toLowerCase()) {
                    label.style.backgroundColor = '#d4edda'; // ສີຂຽວອ່ອນ
                    label.style.border = '1px solid #c3e6cb';
                    label.style.borderRadius = '5px';
                }
            });
        } else if (questionElements.length === 1) { // ກໍລະນີ Text input ຫຼື Textarea
            const inputElement = questionElements[0];
            
            // ປັບປຸງ: ໃຊ້ການປຽບທຽບແບບດຽວກັນກັບຕອນກວດຄະແນນ (ຕັດຍະຫວ່າງ/ລົງແຖວອອກ)
            const uVal = userAnswer.trim().toLowerCase().replace(/\s+/g, ' ');
            const cVal = correctAnswer.trim().toLowerCase().replace(/\s+/g, ' ');

            if (uVal === cVal) {
                inputElement.style.backgroundColor = '#d4edda';
            } else {
                inputElement.style.backgroundColor = '#f8d7da';
                // ສະແດງຄຳຕອບທີ່ຖືກຕ້ອງສຳລັບຄຳຖາມສັ້ນໆ (ເຊັ່ນ q4)
                if (key === 'q4') {
                    const correctAnswerDisplay = document.createElement('div');
                    correctAnswerDisplay.innerHTML = `<small style="color: green; font-size: 12px;">ຄຳຕອບທີ່ຖືກ: ${correctAnswer}</small>`;
                    // insertAfter
                    inputElement.parentNode.insertBefore(correctAnswerDisplay, inputElement.nextSibling);
                }
            }
        }
    }

    // 3. ສ້າງ Overlay Container (ແກ້ໄຂບັນຫາໜ້າຂາວ)
    // ສ້າງກ່ອງສີຂາວມາບັງໜ້າຈໍທັງໝົດຊົ່ວຄາວ ເພື່ອໃຫ້ html2pdf ຖ່າຍຮູບໄດ້ຊັດເຈນ
    const pdfOverlay = document.createElement('div');
    pdfOverlay.style.position = 'fixed';
    pdfOverlay.style.top = '0';
    pdfOverlay.style.left = '0';
    pdfOverlay.style.width = '100%';
    pdfOverlay.style.height = '100%';
    pdfOverlay.style.zIndex = '99999'; // ຢູ່ເທິງສຸດ
    pdfOverlay.style.backgroundColor = '#ffffff';
    pdfOverlay.style.overflow = 'auto'; // ໃຫ້ມີ Scrollbar ຖ້າຍາວ

    pdfOverlay.appendChild(clone);
    document.body.appendChild(pdfOverlay);

    const opt = {
        margin: 10, // ຫຼຸດຂອບລົງເພື່ອໃຫ້ພື້ນທີ່ຫຼາຍຂຶ້ນ
        filename: studentName + '_exam.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(clone).outputPdf('blob').then((blob) => {
        // ລຶບ Overlay ອອກເມື່ອສ້າງແລ້ວ
        document.body.removeChild(pdfOverlay);

        // ກວດສອບອິນເຕີເນັດ
        if (!navigator.onLine) {
            document.getElementById('result').innerHTML += "<p style='color:red; font-weight:bold; font-size: 18px;'>❌ ບໍ່ມີສັນຍານອິນເຕີເນັດ! ກະລຸນາກວດສອບການເຊື່ອມຕໍ່ແລ້ວລອງໃໝ່.</p>";
            return;
        }

        uploadToGoogleDrive(blob, studentName);
    }).catch(err => {
        document.body.removeChild(pdfOverlay);
        console.error(err);
        document.getElementById('result').innerHTML += "<p style='color:red'>❌ ເກີດຂໍ້ຜິດພາດໃນການສ້າງ PDF: " + err.message + "</p>";
    });
}

function uploadToGoogleDrive(blob, studentName) {
    // ປ່ຽນ URL ນີ້ເປັນ Web App URL ທີ່ທ່ານໄດ້ຈາກການ Deploy Google Apps Script ຂອງທ່ານເອງ
    const scriptURL = "https://script.google.com/macros/s/AKfycbzCs0Xy1steyW8rxxmf8o9tO6TUtz1KZcqTGfMbiZxNsY6eOUHtV-cavusnG881D_nv/exec";
    document.getElementById('result').innerHTML += "<p style='color:blue'>ກຳລັງສົ່ງໄປ Google Drive...</p>";
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
        const base64data = reader.result.split(',')[1];
        
        const params = new URLSearchParams();
        params.append("base64", base64data);
        params.append("filename", studentName + "_exam.pdf");
        params.append("mimetype", "application/pdf");

        fetch(scriptURL, { method: 'POST', body: params })
            .then(response => response.text())
            .then(data => {
                if (!data.includes("Success")) {
                    throw new Error(data);
                }
                document.getElementById('result').innerHTML += "<p style='color:green'>✅ ສົ່ງໄປ Google Drive ສຳເລັດ!</p>";
                localStorage.setItem('submitted_' + studentName.trim(), 'true'); // ບັນທຶກວ່າຊື່ນີ້ສົ່ງແລ້ວ

                // Reset ຟອມຫຼັງຈາກ 5 ວິນາທີ
                setTimeout(function () {
                    document.getElementById('quizForm').reset(); // ລ້າງຄຳຕອບ
                    document.getElementById('studentName').value = ""; // ລ້າງຊື່
                    document.getElementById('scoreDisplay').innerText = ""; // ລ້າງຄະແນນ
                    document.getElementById('result').style.display = "none"; // ເຊື່ອງຜົນ
                    document.getElementById('result').innerHTML = ""; // ລ້າງຂໍ້ຄວາມ
                    window.scrollTo({ top: 0, behavior: 'smooth' }); // ເລື່ອນຂຶ້ນເທິງ
                }, 5000);
            })
            .catch(error => { console.error('Error:', error); document.getElementById('result').innerHTML += "<p style='color:red'>❌ ເກີດຂໍ້ຜິດພາດ: " + error.message + "</p>"; });
    };
}