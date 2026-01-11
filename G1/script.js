function checkAnswers() {
    const answers = { q1: 'a', q2: 'a', q3: 'a', q4: 'a', q5: 'a', q6: 'a', q7: 'a', q8: 'a', q9: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' };

    let score = 0;
    let maxScore = 10; // ຄະແນນເຕັມ (ປັບຈາກ 13 ມາເປັນ 10)
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
        let userAnswer = form.elements[key].value;
        let isCorrect = false;

        if (key === 'q9') {
            const cleanVal = userAnswer.replace(/\s+/g, '');
            const target = answers[key]; // ABC...Z
            // ກວດສອບວ່າພິມຖືກຕ້ອງ (ບໍ່ສົນໃຈ Case ແລະ ຍະຫວ່າງ)
            if (cleanVal.toUpperCase() === target) {
                isCorrect = true;
                // ຖ້າພິມແບບບໍ່ສະຫຼັບ (ໃຫຍ່ໝົດ ຫຼື ນ້ອຍໝົດ) ໄດ້ 2 ຄະແນນ
                if (cleanVal === target || cleanVal === target.toLowerCase()) {
                    score += 2;
                } else {
                    score += 1; // ຖ້າພິມສະຫຼັບກັນ ໄດ້ 1 ຄະແນນ
                }
            }
        } else {
            if (userAnswer === answers[key]) {
                score++;
                isCorrect = true;
            }
        }

        // --- ສະແດງຜົນການກວດຄຳຕອບ (ຖືກ/ຜິດ/ສະເລີຍ) ---
        // 1. ກໍລະນີເປັນ Radio Buttons (q1-q8)
        const radios = form.querySelectorAll(`input[name="${key}"]`);
        if (radios.length > 0) {
            const optionsDiv = radios[0].closest('.options');
            let isAnswered = false;

            // ກວດສອບວ່າໄດ້ຕອບບໍ່
            radios.forEach(r => { if (r.checked) isAnswered = true; });

            // Reset styles
            if (optionsDiv) optionsDiv.style.backgroundColor = '';
            radios.forEach(r => {
                r.parentElement.style.backgroundColor = '';
                r.parentElement.style.border = '';
            });

            if (!isAnswered) {
                // ບໍ່ໄດ້ຕອບ: ພື້ນຫຼັງສີບົວ
                if (optionsDiv) {
                    optionsDiv.style.backgroundColor = '#ffc0cb';
                    optionsDiv.style.borderRadius = '10px';
                    optionsDiv.style.padding = '10px';
                }
            }

            radios.forEach(r => {
                const label = r.parentElement;
                if (r.value === answers[key]) {
                    // ສະແດງຄຳຕອບທີ່ຖືກຕ້ອງ (ສີຂຽວ) ສະເໝີ
                    label.style.backgroundColor = '#d4edda';
                    label.style.border = '1px solid #c3e6cb';
                    label.style.borderRadius = '5px';
                } else if (r.checked && r.value !== answers[key]) {
                    // ຖ້າຕອບຜິດ (ສີແດງ)
                    label.style.backgroundColor = '#f8d7da';
                    label.style.border = '1px solid #f5c6cb';
                    label.style.borderRadius = '5px';
                }
            });
        }

        // 2. ກໍລະນີເປັນ Text Input (q9)
        const textInput = form.querySelector(`input[name="${key}"][type="text"]`);
        if (textInput) {
            const parent = textInput.parentElement;
            // ລົບຂໍ້ຄວາມສະເລີຍເກົ່າອອກ (ຖ້າມີ)
            const oldMsg = parent.querySelector('.correct-ans-msg');
            if (oldMsg) oldMsg.remove();

            if (textInput.value.trim() === '') {
                // ບໍ່ໄດ້ຕອບ: ພື້ນຫຼັງສີບົວ
                textInput.style.backgroundColor = '#ffc0cb';
                // ສະແດງຄຳຕອບ
                const msg = document.createElement('div');
                msg.className = 'correct-ans-msg';
                msg.style.color = 'green';
                msg.style.marginTop = '5px';
                msg.innerText = "ຄຳຕອບທີ່ຖືກຕ້ອງແມ່ນ: " + answers[key];
                parent.appendChild(msg);
            } else if (isCorrect) {
                // ຖືກ: ສີຂຽວ
                textInput.style.backgroundColor = '#d4edda';
            } else {
                // ຜິດ: ສີແດງ
                textInput.style.backgroundColor = '#f8d7da';
                // ສະແດງຄຳຕອບ
                const msg = document.createElement('div');
                msg.className = 'correct-ans-msg';
                msg.style.color = 'green';
                msg.style.marginTop = '5px';
                msg.innerText = "ຄຳຕອບທີ່ຖືກຕ້ອງແມ່ນ: " + answers[key];
                parent.appendChild(msg);
            }
        }
    }

    // --- ກວດຄະແນນຂໍ້ 10 (ລະບາຍສີ) ---
    // ລົບເຄື່ອງໝາຍຜິດເກົ່າອອກກ່ອນ (ຖ້າມີ)
    const oldMarks = document.querySelectorAll('.error-mark');
    oldMarks.forEach(el => el.remove());

    const q10Key = {
        'sky': '#0000FF',          // 2=Blue
        'mountain1': '#008000',    // 6=Green
        'mountain2': '#008000',    // 6=Green
        'ground': '#008000',       // 6=Green
        'school_wall': '#FFA500',  // 4=Orange
        'roof': '#FF0000',         // 3=Red
        'door': '#8B4513',         // 5=Brown
        'window1': '#0000FF',      // 2=Blue
        'window2': '#0000FF',      // 2=Blue
        'flag_top': '#FF0000',     // 3=Red
        'flag_mid': '#0000FF',     // 2=Blue
        'flag_bot': '#FF0000',     // 3=Red
        'sun': '#FFFF00',          // 1=Yellow
        'tree_trunk': '#8B4513',   // 5=Brown
        'tree_leaves': '#008000',  // 6=Green
        'flower_left': '#FF0000',  // 3=Red
        'flower_right': '#FFA500', // 4=Orange
        'sign': '#8B4513'          // 5=Brown
    };

    let q10Correct = 0;
    const svg = document.querySelector('svg');

    for (let id in q10Key) {
        const el = document.getElementById(id);
        if (el) {
            const fill = el.getAttribute('fill');
            if (fill === q10Key[id]) {
                q10Correct++;
            } else {
                // ຖ້າຜິດ: ໃສ່ເຄື່ອງໝາຍຄູນສີແດງ (❌)
                const bbox = el.getBBox();
                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", bbox.x + bbox.width / 2);
                text.setAttribute("y", bbox.y + bbox.height / 2);
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("dominant-baseline", "middle");
                text.setAttribute("fill", "red");
                text.setAttribute("font-size", "24");
                text.setAttribute("font-weight", "bold");
                text.setAttribute("class", "error-mark");
                text.textContent = "❌";
                svg.appendChild(text);
            }
        }
    }

    // ຄິດໄລ່ຄະແນນຂໍ້ 10 (ເຕັມ 3 ຄະແນນ)
    let q10Score = (q10Correct / Object.keys(q10Key).length) * 3;
    score += q10Score;

    // ປ່ຽນຄະແນນຈາກເຕັມ 13 ມາເປັນເຕັມ 10
    score = (score / 13) * 10;

    // ປັດຄະແນນເປັນຈຳນວນຖ້ວນ (1.4 -> 1, 1.5 -> 2)
    score = Math.round(score);
    const finalScoreDisplay = score;
    document.getElementById('scoreDisplay').innerText = finalScoreDisplay;

    // ກຳນົດຄຳເຫັນຂອງຄູແບບອັດຕະໂນມັດ
    let comment = "";
    if (score >= 9) comment = "ດີຫຼາຍ";
    else if (score >= 7) comment = "ດີ";
    else if (score >= 5) comment = "ປານກາງ";
    else comment = "ຄວນປັບປຸງ";
    
    document.getElementById('teacherComment').innerText = comment;

    resultDiv.style.display = "block";
    if (score >= 5) { // ຜ່ານເກນ (5/10)
        resultDiv.style.backgroundColor = "#d4edda";
        resultDiv.style.color = "#155724";
        resultDiv.innerHTML = `ເກັ່ງຫຼາຍ ${studentName}! <br> ຄະແນນຂອງເຈົ້າແມ່ນ: ${finalScoreDisplay} / ${maxScore}`;
    } else {
        resultDiv.style.backgroundColor = "#f8d7da";
        resultDiv.style.color = "#721c24";
        resultDiv.innerHTML = `ພະຍາຍາມຕື່ມອີກເດີ້ ${studentName}. <br> ຄະແນນຂອງເຈົ້າແມ່ນ: ${finalScoreDisplay} / ${maxScore}`;
    }
    
    resultDiv.scrollIntoView({behavior: "smooth"});

    generateAndUploadPDF(studentName);
}

function generateAndUploadPDF(studentName) {
    // ກວດສອບວ່າ Library html2pdf ໂຫຼດມາໄດ້ບໍ່
    if (typeof html2pdf === 'undefined') {
        alert("❌ ບໍ່ສາມາດສ້າງ PDF ໄດ້!\nສາເຫດ: ບໍ່ມີອິນເຕີເນັດ ຫຼື ໂຫຼດໂປຣແກຣມສ້າງ PDF ບໍ່ທັນ.\nກະລຸນາກວດສອບອິນເຕີເນັດແລ້ວລອງໃໝ່.");
        return;
    }

    const originalElement = document.querySelector(".container");
    const resultDiv = document.getElementById('result');
    
    resultDiv.innerHTML += "<p style='color:blue'>ກຳລັງສ້າງ PDF...</p>";

    // 1. Clone ແລະ ໃສ່ Class
    const clone = originalElement.cloneNode(true);
    clone.classList.add('pdf-mode');
    
    // --- ແກ້ໄຂບັນຫາ Logo (ເພີ່ມໃໝ່) ---
    // ພະຍາຍາມແປງ Logo ເປັນ Base64 ຖ້າບໍ່ໄດ້ໃຫ້ລຶບອອກເພື່ອບໍ່ໃຫ້ Error ຕອນສ້າງ PDF
    const originalLogo = originalElement.querySelector('header img');
    const cloneLogo = clone.querySelector('header img');
    if (originalLogo && cloneLogo) {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = originalLogo.naturalWidth;
            canvas.height = originalLogo.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(originalLogo, 0, 0);
            const dataURL = canvas.toDataURL('image/jpeg');
            cloneLogo.src = dataURL;
        } catch (e) {
            console.warn("Logo Tainted: Removing from PDF to prevent crash");
            cloneLogo.remove(); // ລຶບ Logo ອອກຈາກ PDF ຖ້າມັນເຮັດໃຫ້ເກີດ Error
        }
    }

    // 2. ດຶງຂໍ້ມູນ
    clone.querySelector('#studentName').value = document.getElementById('studentName').value;
    clone.querySelector('#scoreDisplay').innerText = document.getElementById('scoreDisplay').innerText;
    clone.querySelector('#teacherComment').innerText = document.getElementById('teacherComment').innerText;
    
    const originalRadios = originalElement.querySelectorAll('input[type="radio"]');
    const cloneRadios = clone.querySelectorAll('input[type="radio"]');
    for (let i = 0; i < originalRadios.length; i++) {
        if (originalRadios[i].checked) cloneRadios[i].checked = true;
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

    // ຟັງຊັນສ້າງ PDF (ແຍກອອກມາເພື່ອເອີ້ນໃຊ້ງ່າຍ)
    let isPdfGenerated = false; // ຕົວປ່ຽນກັນບໍ່ໃຫ້ສ້າງ PDF ຊ້ຳ
    const runHtml2Pdf = () => {
        if (isPdfGenerated) return;
        isPdfGenerated = true;

        const opt = {
            margin: 5,
            filename: studentName + '_exam.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 1.5, useCORS: true, scrollY: 0 }, // ລົບ allowTaint ອອກ ແລະ ຫຼຸດ scale
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(clone).outputPdf('blob')
        .then((blob) => {
            document.body.removeChild(pdfOverlay);
            if (!navigator.onLine) {
                document.getElementById('result').innerHTML += "<p style='color:red; font-weight:bold; font-size: 18px;'>❌ ບໍ່ມີສັນຍານອິນເຕີເນັດ! ກະລຸນາກວດສອບການເຊື່ອມຕໍ່ແລ້ວລອງໃໝ່.</p>";
                return;
            }
            uploadToGoogleDrive(blob, studentName);
        })
        .catch((err) => {
            console.error("PDF Error:", err);
            if(document.body.contains(pdfOverlay)) document.body.removeChild(pdfOverlay);
            alert("❌ ເກີດຂໍ້ຜິດພາດໃນການສ້າງ PDF:\n" + err.message + "\n\n(ກະລຸນາກວດສອບຮູບພາບ Logo ຫຼື ລອງປ່ຽນ Browser)");
        });
    };

    // 4. ແປງ SVG ເປັນຮູບພາບ PNG ກ່ອນສ້າງ PDF (ແກ້ໄຂບັນຫາ Error)
    const svg = clone.querySelector('svg');
    if (svg) {
        try {
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svg);
            const img = new Image();
            
            // ຕັ້ງເວລາໄວ້ 3 ວິນາທີ ຖ້າແປງຮູບບໍ່ໄດ້ໃຫ້ຂ້າມໄປເລີຍ (ປ້ອງກັນການຄ້າງ)
            setTimeout(() => {
                console.warn("SVG conversion timed out, skipping...");
                runHtml2Pdf();
            }, 3000);

            // ໃຊ້ base64 ເພື່ອຫຼີກລ່ຽງບັນຫາ URL
            img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgString)));
            
            img.onload = function() {
                const canvas = document.createElement('canvas');
                // ກຳນົດຂະໜາດຕາມ viewBox ຂອງ SVG (400x250)
                canvas.width = 400;
                canvas.height = 250;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                const pngImg = document.createElement('img');
                pngImg.src = canvas.toDataURL('image/png');
                pngImg.style.width = '100%';
                
                svg.parentNode.replaceChild(pngImg, svg);
                runHtml2Pdf(); // ສ້າງ PDF ຫຼັງຈາກແປງຮູບແລ້ວ
            };
            
            img.onerror = function() {
                console.warn("SVG conversion failed, trying raw HTML");
                runHtml2Pdf();
            };
        } catch (e) {
            console.warn("SVG Error:", e);
            runHtml2Pdf();
        }
    } else {
        runHtml2Pdf();
    }
}

function uploadToGoogleDrive(blob, studentName) {
    // ⚠️ ສຳຄັນ: ປ່ຽນ URL ລຸ່ມນີ້ໃຫ້ເປັນ Web App URL ຈາກ Google Apps Script ຂອງທ່ານທີ່ໄດ້ຈາກຂັ້ນຕອນທີ 2
    const scriptURL = "https://script.google.com/macros/s/AKfycbysVg421Nuk2pNqOup-hOxoAX1PuH8Yq3t_XhTBuF2-fBtK_pnNg0tI9qITjOCAw4WJ/exec"; 
    document.getElementById('result').innerHTML += "<p style='color:blue'>ກຳລັງສົ່ງໄປ Google Drive...</p>";
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function() {
        const base64data = reader.result.split(',')[1];
        
        // ປ່ຽນຈາກ FormData ມາເປັນ URLSearchParams ເພື່ອຄວາມສະຖຽນໃນການສົ່ງຂໍ້ມູນ
        const params = new URLSearchParams();
        params.append("base64", base64data);
        params.append("filename", studentName + "_exam.pdf");
        params.append("mimetype", "application/pdf");

        // alert("ກຳລັງອັບໂຫຼດໄປ Google Drive...");

        fetch(scriptURL, { 
            method: 'POST', 
            body: params 
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.text();
        })
        .then(data => { 
            document.getElementById('result').innerHTML += "<p style='color:green'>✅ ສົ່ງໄປ Google Drive ສຳເລັດ!</p>"; 
            localStorage.setItem('submitted_' + studentName.trim(), 'true'); // ບັນທຶກວ່າຊື່ນີ້ສົ່ງແລ້ວ

            // Reset ຟອມຫຼັງຈາກ 5 ວິນາທີ
            setTimeout(function() {
                document.getElementById('quizForm').reset(); // ລ້າງຄຳຕອບ
                document.getElementById('studentName').value = ""; // ລ້າງຊື່
                document.getElementById('scoreDisplay').innerText = ""; // ລ້າງຄະແນນ
                document.getElementById('teacherComment').innerText = ""; // ລ້າງຄຳເຫັນ
                document.getElementById('result').style.display = "none"; // ເຊື່ອງຜົນ
                document.getElementById('result').innerHTML = ""; // ລ້າງຂໍ້ຄວາມ
                window.scrollTo({ top: 0, behavior: 'smooth' }); // ເລື່ອນຂຶ້ນເທິງ
            }, 5000);
        })
        .catch(error => { 
            console.error('Error:', error); 
            document.getElementById('result').innerHTML += "<p style='color:red'>❌ ເກີດຂໍ້ຜິດພາດ: " + error.message + "</p>"; 
            alert("ສົ່ງບໍ່ໄດ້! ກະລຸນາກວດສອບ:\n1. ອິນເຕີເນັດ\n2. ທ່ານໄດ້ Deploy Google Apps Script ເປັນ 'New Version' ແລ້ວບໍ່?");
        });
    };
}

// ຟັງຊັນສຳລັບການລະບາຍສີ (ຂໍ້ 10)
let currentPaintColor = null;

function setPaintColor(color) {
    currentPaintColor = color;
    const display = document.getElementById('currentColorDisplay');
    if (display) {
        display.innerText = "ກຳລັງໃຊ້ສີ: " + (color === '#FFFFFF' ? 'ຢາງລຶບ' : ' ');
        display.style.backgroundColor = color;
        display.style.color = (color === '#0000FF' || color === '#008000' || color === '#800080' || color === '#8B4513') ? 'white' : 'black';
    }
}

function paintArea(element) {
    if (currentPaintColor) {
        element.setAttribute('fill', currentPaintColor);
    } else {
        alert("ກະລຸນາເລືອກສີກ່ອນ!");
    }
}