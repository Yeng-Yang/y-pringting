const q11Text = "ລູກຈະນຳເອົາຄວາມຮູ້ເຫຼົ່ານີ້ໄປສ້າງອະນາຄົດ ແລະ ເປັນທີ່ພຶ່ງພາຂອງຄອບຄົວໃຫ້ໄດ້ໃນວັນຂ້າງໜ້າ.";
const q12Text = "I will use this knowledge to build a successful future and take care of our family in the years to come.";
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzrwhzZfNYXW0TOO82OxD8Vrku0meRZ8d6_yJwLU4VBXoP7rffMzPkQu5ZMMmQ9R0c/exec"; // ປ່ຽນ URL ນີ້ເປັນ Web App URL ຂອງທ່ານ
const GOOGLE_DRIVE_FOLDER_ID = "135Ryql4cwxEhqxkI0gYll21IQSmsKAfy"; // ID ຂອງໂຟນເດີ Google Drive

let currentTab = 0;

document.addEventListener('DOMContentLoaded', () => {
    setupTyping('q11Target', 'q11Input', q11Text);
    setupTyping('q12Target', 'q12Input', q12Text);
    showTab(currentTab);
});

function showTab(n) {
    const x = document.getElementsByClassName("step");
    if (!x[n]) return;
    x[n].style.display = "block";
    
    if (n == 0) {
        document.getElementById("prevBtn").style.display = "none";
    } else {
        document.getElementById("prevBtn").style.display = "inline-block";
    }
    
    if (n == (x.length - 1)) {
        document.getElementById("nextBtn").style.display = "none";
        document.getElementById("submitBtn").style.display = "inline-block";
    } else {
        document.getElementById("nextBtn").style.display = "inline-block";
        document.getElementById("submitBtn").style.display = "none";
    }
    
    document.querySelector('.container').scrollIntoView({behavior: 'smooth'});
}

function nextPrev(n) {
    const x = document.getElementsByClassName("step");
    x[currentTab].style.display = "none";
    currentTab = currentTab + n;
    showTab(currentTab);
}

function setupTyping(displayId, inputId, targetText) {
    const display = document.getElementById(displayId);
    const input = document.getElementById(inputId);
    
    if (!display || !input) return;

    // ປ້ອງກັນການ Paste ຜ່ານ JS ເພີ່ມເຕີມ
    input.addEventListener('paste', e => e.preventDefault());
    input.addEventListener('copy', e => e.preventDefault());
    
    // ເພີ່ມການກວດສອບແບບ Real-time ເວລາພິມ (ພິມປຸບ ກວດປັບ)
    input.addEventListener('input', () => {
        renderText(display, targetText, input.value);
    });
    
    // ສະແດງຂໍ້ຄວາມເລີ່ມຕົ້ນ (ສີເທົາ)
    renderText(display, targetText, "");
}

function renderText(displayElement, targetText, userText) {
    let html = "";
    for (let i = 0; i < targetText.length; i++) {
        const char = targetText[i];
        if (i < userText.length) {
            if (userText[i] === char) {
                html += `<span class="t-correct">${char}</span>`; // ຖືກ = ຂຽວ
            } else {
                html += `<span class="t-wrong">${char}</span>`; // ຜິດ = ແດງ
            }
        } else {
            html += `<span class="t-default">${char}</span>`; // ຍັງບໍ່ພິມ = ເທົາ
        }
    }
    displayElement.innerHTML = html;
}

function checkAnswers() {
    const answers = {
        q1: 'a', q2: 'c', q3: 'c', q4: 'v',
        q5: 'b', q6: 'b', q7: 'd5', q8: '=a5-d5', q9: 'c', q10: '=sum(a1:a10)'
    };

    let theoryScore = 0;
    const totalTheoryQuestions = 10;
    
    const form = document.getElementById('quizForm');
    const resultDiv = document.getElementById('result');
    const studentName = document.getElementById('studentName').value;

    if (studentName.trim() === "") {
        alert("ກະລຸນາໃສ່ຊື່ນັກຮຽນກ່ອນສົ່ງບົດສອບເສັງ!");
        return;
    }

    // ກວດສອບວ່າຊື່ນີ້ເຄີຍສົ່ງແລ້ວຫຼືບໍ່ (Check LocalStorage)
    if (localStorage.getItem('submitted_' + studentName.trim())) {
        alert("ຊື່ນີ້ (" + studentName + ") ໄດ້ສົ່ງບົດສອບເສັງໄປແລ້ວ! ບໍ່ສາມາດສົ່ງຊ້ຳໄດ້.");
        return;
    }

    for (let key in answers) {
        let userAnswer = form.elements[key].value.trim().toLowerCase();
        if (key === 'q8' || key === 'q10') {
            userAnswer = userAnswer.replace(/\s/g, '');
        }
        if (userAnswer === answers[key]) theoryScore++;
    }

    // Typing Section (q11, q12)
    let q11Val = form.elements['q11'].value.trim();
    let q12Val = form.elements['q12'] ? form.elements['q12'].value.trim() : "";

    // Normalize whitespace (convert newlines/tabs to space, collapse multiple spaces)
    q11Val = q11Val.replace(/\s+/g, ' ');
    q12Val = q12Val.replace(/\s+/g, ' ');

    const sim11 = calculateAccuracy(q11Val, q11Text);
    const sim12 = calculateAccuracy(q12Val, q12Text);

    // Calculate Scores: Theory (7 pts) + Typing (3 pts)
    const theoryPoints = (theoryScore / totalTheoryQuestions) * 7;
    const typingPoints = ((sim11 + sim12) / 2) * 3;
    
    let score = Math.round(theoryPoints + typingPoints);

    document.getElementById('scoreDisplay').innerText = score;
    const teacherCommentSpan = document.getElementById('teacherComment');

    if (score >= 7) {
        teacherCommentSpan.innerText = "ເກັ່ງຫຼາຍ!";
    } else {
        teacherCommentSpan.innerText = "ພະຍາຍາມຕື່ມອີກເດີ້";
    }
    
    // Update typing text for clone (so PDF has colored text)
    renderText(document.getElementById('q11Target'), q11Text, q11Val);
    renderText(document.getElementById('q12Target'), q12Text, q12Val);

    // Clear result div and show it (for status messages)
    resultDiv.innerHTML = `<div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">ຊື່: ${studentName} | ຄະແນນ: ${score}/10</div>`;
    resultDiv.style.display = "block";
    resultDiv.style.backgroundColor = "transparent";
    resultDiv.style.color = "inherit";

    generateAndUploadPDF(studentName, score);
    
    // ເລື່ອນລົງມາທີ່ຜົນຄະແນນ (ເພື່ອໃຫ້ເຫັນສະຖານະການສົ່ງ)
    resultDiv.scrollIntoView({behavior: 'smooth'});

    // Hide UI elements to prevent cheating/sharing (ເຊື່ອງຟອມທັງໝົດ)
    document.querySelector('header').style.display = 'none';
    document.querySelector('.header-table').style.display = 'none';
    document.getElementById('quizForm').style.display = 'none';
}

function generateAndUploadPDF(studentName, score) {
    const originalElement = document.querySelector(".container");
    const resultDiv = document.getElementById('result');
    
    resultDiv.innerHTML += "<p style='color:blue'>ກຳລັງສ້າງ PDF...</p>";

    // 1. Clone ແລະ ໃສ່ Class
    const clone = originalElement.cloneNode(true);
    clone.classList.add('pdf-mode');
    
    // 2. ດຶງຂໍ້ມູນ
    clone.querySelector('#studentName').value = document.getElementById('studentName').value;
    
    const q11Src = document.querySelector('[name="q11"]');
    const q12Src = document.querySelector('[name="q12"]');
    if (q11Src) clone.querySelector('[name="q11"]').value = q11Src.value;
    if (q12Src) clone.querySelector('[name="q12"]').value = q12Src.value;

    clone.querySelector('#scoreDisplay').innerText = document.getElementById('scoreDisplay').innerText;
    clone.querySelector('#teacherComment').innerText = document.getElementById('teacherComment').innerText;
    
    const originalRadios = originalElement.querySelectorAll('input[type="radio"]');
    const cloneRadios = clone.querySelectorAll('input[type="radio"]');
    for (let i = 0; i < originalRadios.length; i++) {
        if (originalRadios[i].checked) cloneRadios[i].checked = true;
    }

    // Highlight answers (Correct = Green, Incorrect = Red)
    // ກວດສອບຄຳຕອບ ແລະ ໃສ່ສີ (ຖືກ = ຂຽວ, ຜິດ = ແດງ)
    const answers = {
        q1: 'a', q2: 'c', q3: 'c', q4: 'v',
        q5: 'b', q6: 'b', q7: 'd5', q8: '=a5-d5', q9: 'c', q10: '=sum(a1:a10)'
    };

    for (let key in answers) {
        const inputs = clone.querySelectorAll(`[name="${key}"]`);
        if (inputs.length > 1) {
            // Radio buttons
            let isAnswered = false;
            inputs.forEach(radio => { if (radio.checked) isAnswered = true; });

            if (!isAnswered) {
                const questionDiv = inputs[0].closest('.question');
                if (questionDiv) questionDiv.style.backgroundColor = '#f8d7da'; // ຖ້າບໍ່ໄດ້ຕອບ ໃຫ້ພື້ນຫຼັງຄຳຖາມເປັນສີແດງ
            }

            inputs.forEach(radio => {
                const label = radio.parentElement;
                
                // 1. ສະແດງຄຳຕອບທີ່ຖືກຕ້ອງ (ສີຂຽວ)
                if (radio.value === answers[key]) {
                    label.style.backgroundColor = '#d4edda'; // Green
                    label.style.border = '1px solid #c3e6cb';
                    label.style.borderRadius = '5px';
                }

                // 2. ສະແດງຄຳຕອບທີ່ເລືອກຜິດ (ສີແດງ)
                if (radio.checked && radio.value !== answers[key]) {
                    label.style.backgroundColor = '#f8d7da'; // Red
                    label.style.border = '1px solid #f5c6cb';
                    label.style.borderRadius = '5px';
                }
            });
        } else if (inputs.length === 1) {
            // Text input
            const input = inputs[0];
            let val = input.value.trim().toLowerCase();
            if (key === 'q8' || key === 'q10') val = val.replace(/\s/g, '');
            
            if (val === answers[key]) {
                input.style.backgroundColor = '#d4edda';
            } else {
                input.style.backgroundColor = '#f8d7da'; // ຜິດ ຫຼື ບໍ່ໄດ້ຕອບ (ສີແດງ)
                
                // ເພີ່ມສະເລີຍຄຳຕອບສຳລັບ Text Input ໃນ PDF
                const correctSpan = document.createElement('span');
                correctSpan.style.color = '#155724';
                correctSpan.style.fontSize = '12px';
                correctSpan.style.marginLeft = '5px';
                correctSpan.innerText = `(ຄຳຕອບ: ${answers[key]})`;
                input.parentNode.appendChild(correctSpan);
            }
        }
    }

    if (q11Src) {
        const el = clone.querySelector('[name="q11"]');
        el.style.backgroundColor = calculateAccuracy(el.value.trim().replace(/\s+/g, ' '), q11Text) > 0.8 ? '#d4edda' : '#f8d7da';
    }
    if (q12Src) {
        const el = clone.querySelector('[name="q12"]');
        el.style.backgroundColor = calculateAccuracy(el.value.trim().replace(/\s+/g, ' '), q12Text) > 0.8 ? '#d4edda' : '#f8d7da';
    }

    // 3. ສ້າງ Overlay Container (ແກ້ໄຂບັນຫາໜ້າຂາວ)
    // ສ້າງກ່ອງສີຂາວມາບັງໜ້າຈໍທັງໝົດຊົ່ວຄາວ ເພື່ອໃຫ້ html2pdf ຖ່າຍຮູບໄດ້ຊັດເຈນ
    const pdfOverlay = document.createElement('div');
    pdfOverlay.style.position = 'absolute'; // ປ່ຽນເປັນ absolute ເພື່ອໃຫ້ຂະຫຍາຍຕາມເນື້ອຫາ
    pdfOverlay.style.top = '0';
    pdfOverlay.style.left = '0';
    pdfOverlay.style.width = '100%';
    pdfOverlay.style.minHeight = '100vh'; // ໃຫ້ເຕັມຈໍເປັນຢ່າງໜ້ອຍ
    pdfOverlay.style.zIndex = '99999'; // ຢູ່ເທິງສຸດ
    pdfOverlay.style.backgroundColor = '#ffffff';
    
    pdfOverlay.appendChild(clone);
    document.body.appendChild(pdfOverlay);

    // ປັບຂະໜາດ Textarea ໃຫ້ເທົ່າກັບຂໍ້ຄວາມຕົ້ນສະບັບ (Target) ແປະໆ
    ['q11', 'q12'].forEach(id => {
        const target = clone.querySelector(`#${id}Target`);
        const input = clone.querySelector(`[name="${id}"]`);
        if (target && input) {
            input.style.setProperty('height', target.offsetHeight + 'px', 'important');
            input.style.setProperty('min-height', 'auto', 'important');
        }
    });

    const opt = {
        margin: 4,
        filename: studentName + '_exam.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, scrollY: 0, backgroundColor: '#ffffff' }, // ລົບ useCORS ອອກເພື່ອແກ້ບັນຫາ Tainted Canvas
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // ເພີ່ມເວລາລໍຖ້າ 1 ວິນາທີ ເພື່ອໃຫ້ Browser ກຽມໜ້າ clone ໃຫ້ພ້ອມກ່ອນຖ່າຍຮູບ
    setTimeout(() => {
        html2pdf().set(opt).from(clone).outputPdf('blob').then((blob) => {
            // ລຶບ Overlay ອອກເມື່ອສ້າງແລ້ວ
            document.body.removeChild(pdfOverlay);
            
            // ກວດສອບອິນເຕີເນັດ
            if (!navigator.onLine) {
                document.getElementById('result').innerHTML += "<p style='color:red; font-weight:bold; font-size: 18px;'>❌ ບໍ່ມີສັນຍານອິນເຕີເນັດ! ກະລຸນາກວດສອບການເຊື່ອມຕໍ່ແລ້ວລອງໃໝ່.</p>";
                return;
            }

            uploadToGoogleDrive(blob, studentName, score);
        }).catch(err => {
            console.warn("ເກີດຂໍ້ຜິດພາດກັບຮູບພາບ, ກຳລັງລອງໃໝ່ໂດຍບໍ່ມີ Logo...", err);
            
            // ຖ້າບໍ່ໄດ້ (ອາດຈະເປັນຍ້ອນຮູບ Logo ຕິດສິດທິ Tainted), ໃຫ້ລຶບ Logo ອອກແລ້ວລອງໃໝ່
            const logoImg = clone.querySelector('.logo');
            if (logoImg) logoImg.remove();

            html2pdf().set(opt).from(clone).outputPdf('blob').then((blob) => {
                document.body.removeChild(pdfOverlay);
                if (!navigator.onLine) {
                    document.getElementById('result').innerHTML += "<p style='color:red; font-weight:bold; font-size: 18px;'>❌ ບໍ່ມີສັນຍານອິນເຕີເນັດ! ກະລຸນາກວດສອບການເຊື່ອມຕໍ່ແລ້ວລອງໃໝ່.</p>";
                    return;
                }
                uploadToGoogleDrive(blob, studentName, score);
            }).catch(finalErr => {
                console.error(finalErr);
                document.body.removeChild(pdfOverlay);
                document.getElementById('result').innerHTML += "<p style='color:red'>❌ ເກີດຂໍ້ຜິດພາດໃນການສ້າງ PDF: " + (finalErr.message || finalErr) + "</p>";
            });
        });
    }, 1000);
}

function uploadToGoogleDrive(blob, studentName, score) {
    document.getElementById('result').innerHTML += "<p style='color:blue'>⏳ ກຳລັງສົ່ງໄປ Google Drive... (ກະລຸນາລໍຖ້າ)</p>";
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function() {
        const base64data = reader.result.split(',')[1];
        
        // ປ່ຽນວິທີສົ່ງເປັນ JSON (Text) ເພື່ອແກ້ບັນຫາ CORS ແລະ ຂະໜາດໄຟລ໌
        const payload = {
            base64: base64data,
            filename: studentName + "_exam.pdf",
            mimetype: "application/pdf",
            folderId: GOOGLE_DRIVE_FOLDER_ID,
            studentName: studentName.trim(),
            score: score
        };

        fetch(GOOGLE_SCRIPT_URL, { 
            method: 'POST', 
            body: JSON.stringify(payload) 
        })
        .then(response => response.text())
        .then(data => { 
            if (data.includes("Success")) {
                document.getElementById('result').innerHTML += "<p style='color:green'>✅ ສົ່ງໄປ Google Drive ແລະ ບັນທຶກຄະແນນສຳເລັດ!</p>"; 
                localStorage.setItem('submitted_' + studentName.trim(), 'true'); // ບັນທຶກວ່າຊື່ນີ້ສົ່ງແລ້ວ

                // Reset ຟອມຫຼັງຈາກ 5 ວິນາທີ
                setTimeout(function() {
                    document.getElementById('quizForm').reset(); // ລ້າງຄຳຕອບ
                    document.getElementById('studentName').value = ""; // ລ້າງຊື່
                    document.getElementById('scoreDisplay').innerText = ""; // ລ້າງຄະແນນ
                    document.getElementById('teacherComment').innerText = ""; // ລ້າງຄຳເຫັນ
                    document.getElementById('result').style.display = "none"; // ເຊື່ອງຜົນ
                    document.getElementById('result').innerHTML = ""; // ລ້າງຂໍ້ຄວາມ
                    
                    // Restore visibility (ສະແດງຟອມກັບຄືນມາເມື່ອ Reset)
                    document.querySelector('header').style.display = '';
                    document.querySelector('.header-table').style.display = '';
                    document.getElementById('quizForm').style.display = '';

                    window.scrollTo({ top: 0, behavior: 'smooth' }); // ເລື່ອນຂຶ້ນເທິງ
                    
                    // Clear styles (ລ້າງສີທີ່ໃສ່ໄວ້ອອກ)
                    document.querySelectorAll('#quizForm input, #quizForm label').forEach(el => {
                        el.style.backgroundColor = '';
                        el.style.border = '';
                    });
                    
                    // Reset Steps
                    currentTab = 0;
                    showTab(currentTab);
                    
                    // Reset Typing Display
                    renderText(document.getElementById('q11Target'), q11Text, "");
                    renderText(document.getElementById('q12Target'), q12Text, "");
                }, 5000);
            } else {
                throw new Error(data); // ຖ້າ Server ຕອບກັບມາວ່າ Error
            }
        })
        .catch(error => { 
            console.error('Error:', error); 
            document.getElementById('result').innerHTML += "<p style='color:red'>❌ ການສົ່ງລົ້ມເຫຼວ! (" + error.message + ")</p>"; 
        });
    };
}

function calculateAccuracy(input, target) {
    let correct = 0;
    for (let i = 0; i < target.length; i++) {
        if (i < input.length && input[i] === target[i]) {
            correct++;
        }
    }
    return target.length > 0 ? correct / target.length : 0;
}