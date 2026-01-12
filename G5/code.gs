function doPost(e) {
  try {
    // 1. ຮັບຂໍ້ມູນທີ່ສົ່ງມາຈາກແບບຟອມ (script.js)
    var data = e.parameter.base64;
    var filename = e.parameter.filename || "exam_result.pdf";
    var mimetype = e.parameter.mimetype || "application/pdf";

    // ກວດສອບວ່າຂໍ້ມູນມາຄົບບໍ່
    if (!data) {
      return ContentService.createTextOutput("Error: No data received");
    }

    // 2. ແປງລະຫັດ Base64 ກັບຄືນເປັນໄຟລ໌
    var decoded = Utilities.base64Decode(data);
    var blob = Utilities.newBlob(decoded, mimetype, filename);

    // 3. ສ້າງໄຟລ໌ລົງໃນ Google Drive (Root Folder)
    // ໝາຍເຫດ: ຖ້າຢາກເກັບໄວ້ໃນໂຟນເດີສະເພາະ ໃຫ້ເອົາ ID ຂອງໂຟນເດີມາໃສ່ແທນບ່ອນ "ID_ໂຟນເດີ"
    var folder = DriveApp.getFolderById("1EahGYvVd29Cihc5KhIum7vgEuxENboL3");
    var file = folder.createFile(blob);

    // 4. ສົ່ງຄ່າຕອບກັບວ່າສຳເລັດ
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    return ContentService.createTextOutput("Error: " + error.toString());
  }
}