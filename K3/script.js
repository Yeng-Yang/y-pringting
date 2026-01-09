function checkAnswers() {
    const answers = {
        q1: 'a', q2: 'b', q3: 'a', q4: 'b', q5: 'a',
        q6: 'b', q7: 'c', q8: 'b', q9: 'a', q10: 'b', q11: 'a'
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

    const q12Answer = form.elements['q12'].value.trim().toLowerCase();
    if (q12Answer.includes("ບັນທຶກ") || q12Answer.includes("save") || q12Answer.includes("ເກັບ")) {
        score++;
    }

    // ປ່ຽນຄະແນນຈາກເຕັມ 12 ມາເປັນເຕັມ 10 (ທຽບຄະແນນ)
    score = Math.round((score / 12) * 10);

    document.getElementById('scoreDisplay').innerText = score;

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
    
    resultDiv.innerHTML += "<p style='color:blue'>ກຳລັງສ້າງ PDF...</p>";

    // 1. Clone ແລະ ໃສ່ Class
    const clone = originalElement.cloneNode(true);
    clone.classList.add('pdf-mode');
    
    // 2. ດຶງຂໍ້ມູນ
    clone.querySelector('#studentName').value = document.getElementById('studentName').value;
    clone.querySelector('input[name="q12"]').value = document.querySelector('input[name="q12"]').value;
    clone.querySelector('#scoreDisplay').innerText = document.getElementById('scoreDisplay').innerText;
    
    const originalRadios = originalElement.querySelectorAll('input[type="radio"]');
    const cloneRadios = clone.querySelectorAll('input[type="radio"]');
    for (let i = 0; i < originalRadios.length; i++) {
        if (originalRadios[i].checked) cloneRadios[i].checked = true;
    }

    // Highlight answers (Correct = Green, Incorrect = Red)
    // ກວດສອບຄຳຕອບ ແລະ ໃສ່ສີ (ຖືກ = ຂຽວ, ຜິດ = ແດງ)
    const answers = {
        q1: 'a', q2: 'b', q3: 'a', q4: 'b', q5: 'a',
        q6: 'b', q7: 'c', q8: 'b', q9: 'a', q10: 'b', q11: 'a'
    };

    for (let key in answers) {
        const radios = clone.querySelectorAll(`input[name="${key}"]`);
        radios.forEach(radio => {
            if (radio.checked) {
                const label = radio.parentElement;
                if (radio.value === answers[key]) {
                    label.style.backgroundColor = '#d4edda'; // ສີຂຽວອ່ອນ
                    label.style.border = '1px solid #c3e6cb';
                    label.style.borderRadius = '5px';
                } else {
                    label.style.backgroundColor = '#f8d7da'; // ສີແດງອ່ອນ
                    label.style.border = '1px solid #f5c6cb';
                    label.style.borderRadius = '5px';
                }
            }
        });
    }

    const q12Input = clone.querySelector('input[name="q12"]');
    const q12Val = q12Input.value.trim().toLowerCase();
    if (q12Val.includes("ບັນທຶກ") || q12Val.includes("save") || q12Val.includes("ເກັບ")) {
        q12Input.style.backgroundColor = '#d4edda';
    } else {
        q12Input.style.backgroundColor = '#f8d7da';
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
        margin: 5,
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
    });
}

function uploadToGoogleDrive(blob, studentName) {
    const scriptURL = "https://script.google.com/macros/s/AKfycbw-bndwHR6hiS5nyPByShFUP_VEE_HVxcYW9G2cFIXhEXB7GbhDFGXvx2lL2BPYFilbmw/exec"; 
    document.getElementById('result').innerHTML += "<p style='color:blue'>ກຳລັງສົ່ງໄປ Google Drive...</p>";
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function() {
        const base64data = reader.result.split(',')[1];
        const formData = new FormData();
        formData.append("base64", base64data);
        formData.append("filename", studentName + "_exam.pdf");
        formData.append("mimetype", "application/pdf");
        fetch(scriptURL, { method: 'POST', body: formData })
        .then(response => response.text())
        .then(data => { 
            document.getElementById('result').innerHTML += "<p style='color:green'>✅ ສົ່ງໄປ Google Drive ສຳເລັດ!</p>"; 
            localStorage.setItem('submitted_' + studentName.trim(), 'true'); // ບັນທຶກວ່າຊື່ນີ້ສົ່ງແລ້ວ

            // Reset ຟອມຫຼັງຈາກ 5 ວິນາທີ
            setTimeout(function() {
                document.getElementById('quizForm').reset(); // ລ້າງຄຳຕອບ
                document.getElementById('studentName').value = ""; // ລ້າງຊື່
                document.getElementById('scoreDisplay').innerText = ""; // ລ້າງຄະແນນ
                document.getElementById('result').style.display = "none"; // ເຊື່ອງຜົນ
                document.getElementById('result').innerHTML = ""; // ລ້າງຂໍ້ຄວາມ
                window.scrollTo({ top: 0, behavior: 'smooth' }); // ເລື່ອນຂຶ້ນເທິງ
            }, 5000);
        })
        .catch(error => { console.error('Error:', error); document.getElementById('result').innerHTML += "<p style='color:red'>❌ ເກີດຂໍ້ຜິດພາດໃນການສົ່ງ (ອາດເກີດຈາກບັນຫາອິນເຕີເນັດ).</p>"; });
    };
}