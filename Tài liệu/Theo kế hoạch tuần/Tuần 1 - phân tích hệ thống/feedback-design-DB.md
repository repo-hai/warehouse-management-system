# Feedback & Action Plan: Database Design (Warehouse Management System)

## 1. Các bảng (Entities) còn thiếu
**Vấn đề:**
* Mặc dù sơ đồ có rất nhiều khóa ngoại `warehouseID` (như trong `WarehouseEmployee`, `ProductBatch`), nhưng lại hoàn toàn chưa có bảng `Warehouse` để tham chiếu đến.
* Hệ thống đang thiếu bảng `Category` dùng để phân loại sản phẩm như yêu cầu ban đầu của dự án.

**Giải pháp xử lý:**
* Bổ sung ngay bảng `Warehouse` (gồm `id`, `name`, `address`...).
* Bổ sung bảng `Category` (gồm `id`, `name`, `description`...) và tạo khóa ngoại `categoryID` trong bảng `Product`.
* Đảm bảo tất cả các khóa ngoại liên quan trỏ đúng về Primary Key của các bảng mới này.

## 2. Chuẩn hóa Naming Convention & Tách bảng chứng từ
**Vấn đề:** Việc đặt tên bảng và luồng chứng từ chưa khớp với nghiệp vụ kho thực tế. Việc sử dụng trực tiếp `ProductBatch` để đại diện cho thông tin nhập kho là chưa hợp lý về mặt lưu vết chứng từ.

**Giải pháp xử lý:**
* Đổi tên và cấu trúc lại để phù hợp với chuẩn nghiệp vụ:
    * `ImportReceive` ➔ **`ImportOrder`** (Đơn nhập kho).
    * `ExportRequest` ➔ **`ExportOrder`** (Đơn xuất kho).
    * `ProductExportRequest` ➔ **`ExportOrderItem`** (Chi tiết đơn xuất).
    * `ModifyStockHistory` ➔ **`InventoryHistory`** (Lịch sử biến động tồn kho).
* **Tạo mới bảng `ImportOrderItem`**: Thay vì lưu thông tin nhập thẳng vào `ProductBatch`, hãy tạo bảng `ImportOrderItem` để lưu chi tiết đơn nhập (mặt hàng nào, số lượng bao nhiêu, giá nhập). Sau khi đơn nhập hoàn tất, hệ thống mới kích hoạt logic sinh ra hoặc cập nhật số lượng trong `ProductBatch` (đóng vai trò là Inventory).

## 3. Ràng buộc dữ liệu (Constraints) và Index
**Vấn đề:** Bản thiết kế chưa thể hiện các yêu cầu bắt buộc về tối ưu Database như Index và Composite Unique. Nếu thiếu Index, hệ thống sẽ gặp vấn đề lớn về hiệu năng (Performance) khi dữ liệu truy vấn tăng cao.

**Giải pháp xử lý:**
* **Composite Unique:** Thêm ràng buộc Unique cho cặp `(warehouseID, employeeID)` trong bảng `WarehouseEmployee` để đảm bảo hệ thống không bị lỗi gán một nhân viên vào cùng một kho nhiều lần.
* **Index:** Đánh Index cho các cột thường xuyên được sử dụng trong mệnh đề `WHERE` hoặc `JOIN`:
    * Tất cả các cột Khóa ngoại: `productID`, `orderID`, `warehouseID`, `supplierID`.
    * Các cột dùng để tìm kiếm thường xuyên, ví dụ cột `name` trong bảng `Product`.

## 4. Quản lý Metadata và Thời gian (Timestamps)
**Vấn đề:** Các trường lưu trữ thời gian đang khá lộn xộn và không có sự thống nhất (lúc thì dùng `createdAt`, lúc dùng `importAt`, lúc lại `modifyAt`).

**Giải pháp xử lý:**
* Thống nhất thêm hai trường `createdAt` và `updatedAt` vào **tất cả các bảng** để tracking thời điểm tạo và cập nhật bản ghi (chốt dùng `camelCase` toàn bộ cho đồng nhất với thiết kế hiện tại).
* Giữ lại các trường thời gian nghiệp vụ thực tế như `importDate`, `exportDate` trong các bảng chứng từ (`ImportOrder`, `ExportOrder`) để ghi nhận thời điểm hàng hóa thực sự ra/vào kho, tách biệt hoàn toàn với thời điểm bản ghi được tạo ra trong hệ thống (`createdAt`).