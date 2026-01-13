function checkAnswers() {
    const answers = {
        q1: 'b', q2: 'c', q3: 'b', q4: 'b', q5: 'b',
        q6: 'c', q7: 'c', q8: 'b', q9: 'c', q10: 'a', q11: 'b'
    };

    let score = 0;
    let totalQuestions = 10;
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
        const userAnswer = form.elements[key].value;
        if (userAnswer === answers[key]) score++;
    }

    // ກວດສອບຂໍ້ 12 (ຈັບຄູ່)
    const q12_answers = {
        q12_1: 'c', // Word -> C
        q12_2: 'e', // Excel -> E
        q12_3: 'a', // PowerPoint -> A
        q12_4: 'b', // Access -> B
        q12_5: 'd'  // Outlook -> D
    };
    for (let key in q12_answers) {
        if (form.elements[key].value === q12_answers[key]) score++;
    }

    // ປ່ຽນຄະແນນຈາກເຕັມ 16 (11 ຂໍ້ປາລະໄນ + 5 ຂໍ້ຍ່ອຍຈັບຄູ່) ມາເປັນເຕັມ 10
    score = Math.round((score / 16) * 10);

    document.getElementById('scoreDisplay').innerText = score;

    // ລະບົບຕື່ມຄຳເຫັນຂອງຄູອັດຕະໂນມັດ
    let comment = "";
    if (score >= 9) comment = "ດີເລີດ";
    else if (score >= 7) comment = "ດີ";
    else if (score >= 5) comment = "ພໍໃຊ້";
    else comment = "ຄວນປັບປຸງ";
    
    document.getElementById('teacherComment').innerText = comment;

    resultDiv.style.display = "block";
    if (score >= 7) {
        resultDiv.style.backgroundColor = "#d4edda";
        resultDiv.style.color = "#155724";
        resultDiv.innerHTML = `ເກັ່ງຫຼາຍ ${studentName}! <br> ຄະແນນຂອງເຈົ້າແມ່ນ: ${score} / ${totalQuestions}`;
    } else {
        resultDiv.style.backgroundColor = "#f8d7da";
        resultDiv.style.color = "#721c24";
        resultDiv.innerHTML = `ພະຍາຍາມຕື່ມອີກເດີ້ ${studentName}. <br> ຄະແນນຂອງເຈົ້າແມ່ນ: ${score} / ${totalQuestions}`;
    }
    
    resultDiv.scrollIntoView({behavior: "smooth"});

    generateAndUploadPDF(studentName);
}

function generateAndUploadPDF(studentName) {
    const originalElement = document.querySelector(".container");
    const resultDiv = document.getElementById('result');

    if (typeof html2pdf === 'undefined') {
        resultDiv.innerHTML += "<p style='color:red'>❌ ບໍ່ສາມາດໂຫຼດ Library ສ້າງ PDF ໄດ້. ກະລຸນາກວດສອບອິນເຕີເນັດ.</p>";
        return;
    }
    
    resultDiv.innerHTML += "<p style='color:blue'>ກຳລັງສ້າງ PDF...</p>";

    // 1. Clone ແລະ ໃສ່ Class
    const clone = originalElement.cloneNode(true);
    clone.classList.add('pdf-mode');
    
    // 2. ດຶງຂໍ້ມູນ
    clone.querySelector('#studentName').value = document.getElementById('studentName').value;
    
    // FIX: ປ້ອງກັນ Error "Tainted Canvas" ຈາກຮູບພາບ (Logo) ເວລາລັນແບບ Local file
    // ຖ້າເປີດຜ່ານ file:// ຮູບພາບຈະເຮັດໃຫ້ສ້າງ PDF ບໍ່ໄດ້, ຈຶ່ງຕ້ອງເຊື່ອງມັນໃນ PDF
    const logo = clone.querySelector('img');
    if (logo && window.location.protocol === 'file:') {
        logo.style.display = 'none'; 
    }

    // FIX: ປ່ຽນ Canvas ເປັນຮູບພາບ (Base64) ເພື່ອໃຫ້ html2pdf ເຮັດວຽກໄດ້ດີຂຶ້ນ ແລະ ບໍ່ Error
    const originalCanvas = originalElement.querySelector('#matchingCanvas');
    const cloneGameContainer = clone.querySelector('#matchingGame');
    const cloneCanvas = clone.querySelector('#matchingCanvas');
    
    if (originalCanvas && cloneGameContainer) {
        try {
            const dataUrl = originalCanvas.toDataURL(); // ແປງເສັ້ນທີ່ຂີດເປັນຮູບພາບ
            const img = document.createElement('img');
            img.src = dataUrl;
            img.style.position = 'absolute';
            img.style.top = '0';
            img.style.left = '0';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.zIndex = '1';
            img.style.pointerEvents = 'none'; // ໃຫ້ຄລິກຜ່ານໄດ້
            
            if (cloneCanvas) cloneCanvas.remove(); // ລຶບ Canvas ເປົ່າໃນ Clone ອອກ
            cloneGameContainer.appendChild(img); // ໃສ່ຮູບແທນ
        } catch (e) {
            console.error("Canvas conversion failed:", e);
        }
    }

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
        q1: 'b', q2: 'c', q3: 'b', q4: 'b', q5: 'b',
        q6: 'c', q7: 'c', q8: 'b', q9: 'c', q10: 'a', q11: 'b'
    };

    for (let key in answers) {
        const radios = clone.querySelectorAll(`input[name="${key}"]`);
        let isAnswered = false;
        radios.forEach(radio => {
            if (radio.checked) {
                isAnswered = true;
                const label = radio.parentElement;
                if (radio.value === answers[key]) {
                    label.style.backgroundColor = '#d4edda'; // ສີຂຽວອ່ອນ
                } else {
                    label.style.border = '1px solid #f5c6cb';
                    label.style.borderRadius = '5px';
                }
            }
        });

        // ຖ້າຍັງບໍ່ໄດ້ຕອບ (ສີບົວ)
        if (!isAnswered && radios.length > 0) {
            const questionDiv = radios[0].closest('.question');
            if (questionDiv) {
                questionDiv.style.backgroundColor = '#ffeef0'; // ສີບົວ
                questionDiv.style.border = '1px solid #f5c6cb';
            }
        }
    }

    // ກວດສອບຂໍ້ 12 (Matching) ໃນ PDF
    const q12_correct = { '1': 'c', '2': 'e', '3': 'a', '4': 'b', '5': 'd' };
    for (let i = 1; i <= 5; i++) {
        const inputVal = document.getElementById(`input_q12_${i}`).value;
        const leftItem = clone.querySelector(`#col-left .match-item[data-val="${i}"]`);
        
        if (leftItem) {
            if (inputVal) {
                if (inputVal === q12_correct[i]) {
                    leftItem.style.backgroundColor = '#d4edda'; // Green
                    leftItem.style.borderColor = '#28a745';
                } else {
                    leftItem.style.backgroundColor = '#f8d7da'; // Red
                    leftItem.style.borderColor = '#dc3545';
                }
            } else {
                leftItem.style.backgroundColor = '#ffeef0'; // Pink (Unanswered)
                leftItem.style.borderColor = '#f5c6cb';
            }
        }
    }

    // 3. ສ້າງ Overlay Container (ແກ້ໄຂບັນຫາໜ້າຂາວ)
    // ສ້າງກ່ອງສີຂາວມາບັງໜ້າຈໍທັງໝົດຊົ່ວຄາວ ເພື່ອໃຫ້ html2pdf ຖ່າຍຮູບໄດ້ຊັດເຈນ
    const pdfOverlay = document.createElement('div');
    pdfOverlay.style.position = 'fixed';
    pdfOverlay.style.top = '0';
    pdfOverlay.style.left = '-10000px'; // ຍ້າຍອອກໄປນອກໜ້າຈໍແທນການບັງ
    pdfOverlay.style.width = '100%';
    pdfOverlay.style.height = '100%';
    pdfOverlay.style.zIndex = '-1'; // ໄປຢູ່ທາງຫຼັງ
    
    pdfOverlay.appendChild(clone);
    document.body.appendChild(pdfOverlay);

    const opt = {
        margin: 5,
        filename: studentName + '_exam.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(clone).outputPdf('blob').then((blob) => {
        // ລຶບ Overlay ອອກເມື່ອສ້າງແລ້ວ
        if(document.body.contains(pdfOverlay)) document.body.removeChild(pdfOverlay);
        
        // ກວດສອບອິນເຕີເນັດ
        if (!navigator.onLine) {
            document.getElementById('result').innerHTML += "<p style='color:red; font-weight:bold; font-size: 18px;'>❌ ບໍ່ມີສັນຍານອິນເຕີເນັດ! ກະລຸນາກວດສອບການເຊື່ອມຕໍ່ແລ້ວລອງໃໝ່.</p>";
            return;
        }

        uploadToGoogleDrive(blob, studentName);
    }).catch(err => {
        console.error(err);
        if(document.body.contains(pdfOverlay)) document.body.removeChild(pdfOverlay);
        resultDiv.innerHTML += "<p style='color:red'>❌ ເກີດຂໍ້ຜິດພາດໃນການສ້າງ PDF (" + err.message + ").</p>";
    });
}

function uploadToGoogleDrive(blob, studentName) {
    // ວາງ Web App URL ທີ່ທ່ານ Copy ມາຈາກ Google Apps Script ໃສ່ບ່ອນນີ້
    const scriptURL = "https://script.google.com/macros/s/AKfycbzIYJJvAr5UIPfE06P1J6x2L9JWzXmosoSpm4MjPK_FkI078-Ill8CIY31K8_GYgq8/exec";
    document.getElementById('result').innerHTML += "<p style='color:blue'>ກຳລັງສົ່ງໄປ Google Drive...</p>";
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function() {
        const base64data = reader.result.split(',')[1];
        
        // ໃຊ້ URLSearchParams ແທນ FormData ເພື່ອແກ້ໄຂບັນຫາການສົ່ງຂໍ້ມູນ
        const params = new URLSearchParams();
        params.append("base64", base64data);
        params.append("filename", studentName + "_exam.pdf");
        params.append("mimetype", "application/pdf");

        fetch(scriptURL, { method: 'POST', body: params })
        .then(response => response.text())
        .then(data => { 
            if (data.includes("Success")) {
                document.getElementById('result').innerHTML += "<p style='color:green'>✅ ສົ່ງໄປ Google Drive ສຳເລັດ!</p>"; 
                localStorage.setItem('submitted_' + studentName.trim(), 'true'); // ບັນທຶກວ່າຊື່ນີ້ສົ່ງແລ້ວ

                // Reset ຟອມຫຼັງຈາກ 5 ວິນາທີ (ໂຫຼດໜ້າໃໝ່ເພື່ອລ້າງທຸກຢ່າງລວມທັງເສັ້ນທີ່ຂີດ)
                setTimeout(function() {
                    location.reload(); 
                }, 5000);
            } else {
                throw new Error(data); // ຖ້າ Google Script ສົ່ງ Error ກັບມາ
            }
        })
        .catch(error => { 
            console.error('Error:', error); 
            document.getElementById('result').innerHTML += "<p style='color:red'>❌ ສົ່ງບໍ່ສຳເລັດ! (" + error.message + ")</p>"; 
        });
    };
}

// ==========================================
// Logic ສຳລັບເກມຈັບຄູ່ (Matching Game)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('matchingCanvas');
    const container = document.getElementById('matchingGame');
    const ctx = canvas.getContext('2d');
    let isDragging = false;
    let startItem = null;
    let currentMouse = { x: 0, y: 0 };
    
    // ເກັບຂໍ້ມູນການຈັບຄູ່: { '1': 'c', '2': 'e' } (Left ID -> Right ID)
    let connections = {};

    function resizeCanvas() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        draw();
    }
    window.addEventListener('resize', resizeCanvas);
    // ເອີ້ນໃຊ້ຄັ້ງທຳອິດ
    setTimeout(resizeCanvas, 100);

    function getCoords(element) {
        const rect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const isLeft = element.parentElement.id === 'col-left';
        return {
            x: isLeft ? (rect.right - containerRect.left) : (rect.left - containerRect.left),
            y: (rect.top + rect.height / 2) - containerRect.top
        };
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        // ແຕ້ມເສັ້ນທີ່ເຊື່ອມຕໍ່ແລ້ວ
        for (let leftVal in connections) {
            const rightVal = connections[leftVal];
            const leftEl = document.querySelector(`#col-left .match-item[data-val="${leftVal}"]`);
            const rightEl = document.querySelector(`#col-right .match-item[data-val="${rightVal}"]`);
            
            if (leftEl && rightEl) {
                const start = getCoords(leftEl);
                const end = getCoords(rightEl);
                
                ctx.beginPath();
                ctx.strokeStyle = '#007bff'; // ສີເສັ້ນທີ່ຢືນຢັນແລ້ວ
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
        }

        // ແຕ້ມເສັ້ນທີ່ກຳລັງລາກ
        if (isDragging && startItem) {
            const start = getCoords(startItem);
            ctx.beginPath();
            ctx.strokeStyle = '#ff9800'; // ສີເສັ້ນຕອນກຳລັງລາກ
            ctx.setLineDash([5, 5]); // ເສັ້ນປະ
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(currentMouse.x, currentMouse.y);
            ctx.stroke();
            ctx.setLineDash([]); // Reset
        }
    }

    function handleStart(e) {
        e.preventDefault(); // ປ້ອງກັນການ Scroll ໃນມືຖື
        const target = e.target.closest('.match-item');
        if (!target) return;

        startItem = target;
        isDragging = true;
        
        // ອັບເດດຕຳແໜ່ງເມົາສ໌ເລີ່ມຕົ້ນ
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const containerRect = container.getBoundingClientRect();
        currentMouse = {
            x: clientX - containerRect.left,
            y: clientY - containerRect.top
        };
        draw();
    }

    function handleMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const containerRect = container.getBoundingClientRect();
        currentMouse = {
            x: clientX - containerRect.left,
            y: clientY - containerRect.top
        };
        draw();
    }

    function handleEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        
        // ຊອກຫາ Element ທີ່ປ່ອຍເມົາສ໌ໃສ່
        const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
        
        // ໃຊ້ elementFromPoint ເພື່ອຊອກຫາເປົ້າໝາຍ
        const targetEl = document.elementFromPoint(clientX, clientY);
        const targetItem = targetEl ? targetEl.closest('.match-item') : null;

        if (targetItem && startItem && targetItem !== startItem) {
            const startParent = startItem.parentElement.id;
            const targetParent = targetItem.parentElement.id;

            // ຕ້ອງຢູ່ຄົນລະຝັ່ງກັນ (ຊ້າຍ-ຂວາ ຫຼື ຂວາ-ຊ້າຍ)
            if (startParent !== targetParent) {
                const leftItem = startParent === 'col-left' ? startItem : targetItem;
                const rightItem = startParent === 'col-right' ? startItem : targetItem;
                
                const lVal = leftItem.dataset.val;
                const rVal = rightItem.dataset.val;

                // ລຶບການເຊື່ອມຕໍ່ເກົ່າຂອງທັງສອງຝັ່ງ (ຖ້າມີ)
                // 1. ລຶບຄ່າທີ່ຊ້ຳໃນ connections (ຖ້າ rVal ຖືກໃຊ້ຢູ່ບ່ອນອື່ນ)
                for (let key in connections) {
                    if (connections[key] === rVal) delete connections[key];
                }
                
                // 2. ບັນທຶກຄ່າໃໝ່
                connections[lVal] = rVal;

                // ອັບເດດ Hidden Inputs
                document.getElementById(`input_q12_${lVal}`).value = rVal;
            }
        }
        
        startItem = null;
        draw();
    }

    // Mouse Events
    container.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    // Touch Events (ສຳລັບມືຖື/ແທັບເລັດ)
    container.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);

    // ປຸ່ມ Reset ສຳລັບເກມຈັບຄູ່
    const resetBtn = document.getElementById('resetMatchingBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            connections = {}; // ລ້າງຂໍ້ມູນການເຊື່ອມຕໍ່
            // ລ້າງຄ່າໃນ Hidden Inputs
            for (let i = 1; i <= 5; i++) {
                document.getElementById(`input_q12_${i}`).value = '';
            }
            draw(); // ແຕ້ມ Canvas ໃໝ່ (ຈະເປັນການລຶບເສັ້ນອອກໝົດ)
        });
    }
});