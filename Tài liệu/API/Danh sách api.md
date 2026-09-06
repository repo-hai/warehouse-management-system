\- Quản lý hàng hóa toàn bộ các kho:

&#x09;+ Thêm, sửa, tìm kiếm theo tên, tìm kiếm phân trang, tìm theo mã



\- Quản lý danh mục hàng hóa:

&#x09;+ Thêm danh mục, thêm hàng vào danh mục, sửa, xóa, tìm kiếm danh mục theo tên có phân trang, tìm kiếm thông thường có phân trang, tìm sản phẩm trong danh mục, xóa sản phẩm khỏi danh mục



\- Quản lý kho: thêm, sửa kho



\- Quản lý hàng hóa và lô hàng trong kho:

&#x09;+ Thêm hàng hóa vào kho, xóa hàng hóa khỏi kho, tìm kiếm hàng hóa trong kho: thông thường, theo tên, sử dụng thường xuyên: nhập, xuất gần đây

&#x09;+ Sửa số lượng sản phẩm trong lô hàng, sửa thông tin lô hàng



\- Quản lý đại lý:

&#x09;+ Thêm, sửa, tìm kiếm có phân trang theo tên, tìm kiếm có phân trang thông thường, tìm đại lý gần đây đặt hàng hoặc xuất hàng tới



\- Quản lý nhà cung cấp:

&#x09;+ Thêm, sửa, tìm kiếm có phân trang theo tên, tìm kiếm có phân trang thông thường, tìm nhà cung cấp gần đây nhập hàng



\- Quản lý tài khoản nhân viên trong kho - nhân viên quản lý:

&#x09;+ Thêm nhân viên vào kho, xóa nhân viên khỏi kho, tìm kiếm nhân viên có phân trang theo tên, tìm kiếm thông thường có phân trang



\- Quản lý tài khoản toàn hệ thống - admin:

&#x09;+ Thêm, sửa tài khoản nhân viên, quản lý, admin. Tìm kiếm tài khoản thông thường có phân trang, tìm kiếm theo tên



\- Quản lý đơn đặt hàng:

&#x09;+ Lấy các sản phẩm còn thiếu trong đơn đặt, thêm đơn, sửa đơn khi đơn chưa hoàn thành, xóa đơn khi chưa xuất kho, tìm kiếm đơn theo bộ lọc: xếp theo ngày đặt, xếp theo deadline, xếp theo đại lý đặt, tìm theo trạng thái đơn, tìm theo mã



\- Quản lý đơn nhập kho: có lưu lịch sử

&#x09;+ nhân viên thêm đơn đặt mới, sửa đơn khi quản lý chưa xác nhận, xóa đơn khi quản lý chưa xác nhận, quản lý xác nhận đơn, tìm kiếm đơn theo bộ lọc: xếp theo ngày, xếp theo trạng thái đơn, lọc theo trạng thái đơn, xếp theo nhà cung cấp, tìm theo mã



\- Quản lý đơn xuất kho: có lưu lịch sử

&#x09;+ Thêm đơn, sửa đơn khi quản lý chưa xác nhận, xóa đơn khi quản lý chưa xác nhận, quản lý xác nhận đơn, xóa đơn khi đã xác nhận, tìm kiếm đơn theo bộ lọc: xếp theo ngày xuất kho, tìm theo trạng thái đơn, tìm theo mã



\- Xem thống kê theo kho hoặc toàn bộ hệ thống:

&#x09;+ getWarehouseProductStatistic/getProductStatistic: Thống kê hàng tồn kho nhiều/ít nhất

&#x09;+ getWarehouseProductStatistic/getProductStatistic: Thống kê hàng bán chạy/chậm nhất

&#x09;+ getStockStatistic: Thống kê tổng hàng tồn kho: sum(product.stock)

&#x09;+ getProductStatistic/getWarehouseStatistic: Thống kê hàng sắp hết hạn

&#x09;+ getSupplierStatistic: Thống kê nhà cung cấp hàng đầu: bao nhiêu sản phẩm, sản phẩm nào nhiều nhất

&#x09;+ getAgentsStatistic: Thống kê đại lý mua nhiều: bao nhiêu sản phẩm, sản phẩm nào nhiều nhất

&#x09;+ getMonthlyExportStatistic: Báo cáo xuất/nhập theo tháng: xuất bao nhiêu đơn, mỗi đơn trung bình bao nhiêu sản phẩm, biểu đồ xuất theo tháng

&#x09;+ getInventoryHistoriesStatistic: Xem lịch sử xuất/nhập kho chung toàn kho, xem lịch sử xuất/nhập kho theo sản phẩm (bộ lọc)



* Redis và queue mất 1 ngày

&#x09;- Redis: cache, update cache

&#x09;- Queue: gửi thông báo cho người dùng khi xuất, nhập kho

* **Test mất 4 ngày:**

  * **Nhập kho**
  * **Xuất kho**
  * **Đặt đơn**
  * **Điều chỉnh kho**

