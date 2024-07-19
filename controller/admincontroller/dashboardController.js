const orderSchema = require('../../model/orderSchema')


const dashboardRender = async (req, res) => {
    try {

        // Fetching order details for calculations
        const orderDetailsProfit = await orderSchema.find({ isCancelled: false, orderStatus: { $nin: 'Pending' } })
            .populate('products.productID')
            .sort({ createdAt: -1 });

        // Total number of orders
        const totalCollections = await orderSchema.countDocuments();

        // Current date
        const currentDate = new Date();
        // Start of today, week, and month
        const startOfToday = new Date(currentDate.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        // Arrays for daily sales and daily array
        const dailySalesArray = [];
        const dailyArray = [];

        // Iterate over days starting from today to start of the month
        let dayIterator = new Date(currentDate);
        while (dayIterator >= startOfMonth) {
            const dayStart = new Date(dayIterator);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayIterator);
            dayEnd.setHours(23, 59, 59, 999);

            const dayTotal = orderDetailsProfit.reduce((acc, ele) => {
                const eleDate = new Date(ele.createdAt);
                if (eleDate >= dayStart && eleDate <= dayEnd) {
                    return acc + ele.totalPrice;
                }
                return acc;
            }, 0);

            dailySalesArray.push(dayTotal);
            dailyArray.push(dayStart.getDate());

            dayIterator.setDate(dayIterator.getDate() - 1); // Move to the previous day
        }

        // Monthly sales array
        const monthlySalesArray = new Array(12).fill(0); // Initialize array with 12 zeros
        orderDetailsProfit.forEach(order => {
            const month = new Date(order.createdAt).getMonth();
            monthlySalesArray[month] += order.totalPrice;
        });


        // find the number of payment methods
        let payByCash = 0
        let payByRazorPay = 0
        let payByWallet = 0

        orderDetailsProfit.forEach((order) => {
            if (order.paymentMethod === 'Cash on delivery') {
                payByCash++;
            }
            if (order.paymentMethod === 'Razor pay') {
                payByRazorPay++;
            }
            if (order.paymentMethod === 'Wallet') {
                payByWallet++;
            }
        })

        const paymentMethodChart = [payByCash, payByRazorPay, payByWallet]


        res.render('admin/dashboard', {
            title: "Admin dashboard",
            alertMessage: req.flash('errorMessage'),
            dailySalesArray,
            dailyArray,
            monthlySalesArray,
            paymentMethodChart,
            totalCollections
        });
    } catch (err) {
        console.log(`Error on dashboard render: ${err}`);
    }
}
const salesRender = async (req, res) => {
    try {

        // Fetching order details for calculations
        const orderDetailsProfit = await orderSchema.find({ isCancelled: false, orderStatus: { $nin: 'Pending' } })
            .populate('products.productID')
            .sort({ createdAt: -1 });

        // Total number of orders
        const totalCollections = await orderSchema.countDocuments();

        // Current date
        const currentDate = new Date();
        // Start of today, week, and month
        const startOfToday = new Date(currentDate.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

       

        // Calculate daily, weekly, and monthly reports
        const dailyReport = calculateReport(orderDetailsProfit, startOfToday);
        const weeklyReport = calculateReport(orderDetailsProfit, startOfWeek);
        const monthlyReport = calculateReport(orderDetailsProfit, startOfMonth);

        // Overall sales amount and count
        const overallSalesAmount = orderDetailsProfit.reduce((acc, ele) => acc + ele.totalPrice, 0);
        const overallSalesCount = orderDetailsProfit.length;

        // Overall discount calculation
        let overallDiscount = orderDetailsProfit.reduce((acc, ele) => acc + ele.couponDiscount, 0);
        overallDiscount += orderDetailsProfit.reduce((acc, ele) => {
            return acc + ele.products.reduce((prodAcc, product) => {
                return prodAcc + (((product.price / 100) * product.discount) * product.quantity);
            }, 0);
        }, 0);

       


        res.render('admin/sales', {
            title: "Admin Sales",
            alertMessage: req.flash('errorMessage'),
            dailyReport,
            weeklyReport,
            monthlyReport,
            overallSalesAmount,
            overallSalesCount,
            overallDiscount,
            totalCollections
        });
    } catch (err) {
        console.log(`Error on Sales render: ${err}`);
    }
}

// Helper function to calculate report based on start date
function calculateReport(orderDetailsProfit, startDate) {
    return orderDetailsProfit.reduce((acc, ele) => {
        if (new Date(ele.createdAt) >= startDate) {
            return acc + ele.totalPrice;
        }
        return acc;
    }, 0);
}


const customSalesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        // Validate start and end dates
        if (!startDate || !endDate) {
            return res.status(400).json({ error: "Start date and end date are required" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Set end time to the end of the day

        // Fetch orders within the specified date range
        const orders = await orderSchema.find({ createdAt: { $gte: start, $lte: end }, isCancelled: false });

        // Calculate total sales
        const sale = orders.reduce((acc, order) => acc + order.totalPrice, 0);
        return res.status(200).json({ success: "Report Generated", salesReport: sale });
    } catch (err) {
        console.error(`Error on generating custom sales report: ${err}`);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const customSalesReportGet = (req, res) => {
    try {
        res.render('admin/customSales', { title: 'Custom sales report', alertMessage: req.flash('errorMessage') })
    } catch (err) {
        console.log('error on rendering custom sales report', err)
    }
}

const trendingProducts = async (req, res) => {
    try {

        //finding top selling products and getting their details from the db
        const productsTopTrending = await orderSchema.aggregate([
            { $unwind: '$products' },
            { $group: { _id: '$products.productID', count: { $sum: '$products.quantity' } } },
            { $sort: { 'count': -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            {
                $project: {
                    _id: 0,
                    productName: '$productDetails.productName',
                    brand: '$productDetails.brand',
                    price: '$productDetails.productPrice',
                    image: `$productDetails.image`,
                    productsTotal: '$count'

                }
            }
        ])
        console.log(productsTopTrending);

        //finding top selling brands

        const brandTopTrending = await orderSchema.aggregate([
            { $unwind: '$products' },
            { $group: { '_id': '$products.brand', count: { $sum: '$products.quantity' } } },
            { $sort: { 'count': -1 } },
            { $limit: 10 },
            {
                $project: {
                    _id: 0,
                    brandName: '$_id',
                    brandsTotal: '$count'
                }
            }

        ])

        //finding top selling categories  
        const categoryTopTrending = await orderSchema.aggregate([
            { $unwind: '$products' },
            { $group: { '_id': '$products.category', count: { $sum: '$products.quantity' } } },
            { $sort: { 'count': -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            },
            { $unwind: '$categoryDetails' },
            {
                $project: {
                    _id: 0,
                    categoryName: '$categoryDetails.categoryName',
                    categoryTotal: '$count'
                }
            }
        ])

        res.render('admin/trending', {
            title: 'trending',
            alertMessage: req.flash('errorMessage'),
            productsTopTrending,
            brandTopTrending,
            categoryTopTrending,
        })

    } catch (err) {

    }
}


const downloadPdfReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        // Validate start and end dates
        if (!startDate || !endDate) {
            return res.status(400).json({ error: "Start date and end date are required" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Set end time to the end of the day

        // Get the order details from order collection
        const orderDetails = await orderSchema.find({ createdAt: { $gte: start, $lte: end } }).populate('products.productID').sort({ createdAt: -1 });
        const orderDetailsWithoutCancelled = await orderSchema.find({ createdAt: { $gte: start, $lte: end },isCancelled: false, orderStatus: { $nin: 'Pending' } }).populate('products.productID').sort({ createdAt: -1 });

        const doc = new PDFDocument();
        const filename = `Cleat Craft Sales Report ${Date.now()}.pdf`;

        res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
        res.setHeader("Content-Type", "application/pdf");

        doc.pipe(res);

        // Add header aligned to center 
        doc.font("Helvetica-Bold").fontSize(36).text("Cleat Craft", { align: "center", margin: 10 });
        doc.font("Helvetica-Bold").fillColor("grey").fontSize(8).text("Empowering your game with elite football footwear", { align: "center", margin: 10 });
        doc.moveDown();

        // Add logo to the left side
        // doc.image('public/img/somePlant.jpeg', {
        //     width: 100,
        //     x: 410, // Adjust for desired left margin
        //     y: 80 // Adjust for vertical position
        // });

        doc.moveDown();

        // Add address details of the company
        doc.fontSize(10).fillColor("black").text(`Address: Trivandrum, Shangumugham`);
        doc.text(`Pincode: 789589`);
        doc.text(`Phone: 987 121 120`);

        doc.moveDown();

        const totalSale = orderDetailsWithoutCancelled.reduce((acc, sum) => acc + sum.totalPrice, 0)
        const totalOrders = orderDetailsWithoutCancelled.length

        // Add total sales report
        doc.text(`Total Orders : ${totalOrders}`);
        doc.fontSize(10).fillColor("red").text(`Total Sales : Rs ${totalSale}`);

        // Move to the next line after the details
        doc.moveDown();

        doc.moveDown(); // Move down after the title
        doc.font("Helvetica-Bold").fillColor("black").fontSize(14).text(`Sales Report`, { align: "center", margin: 10 });
        doc.fontSize(12).text(`From ${startDate} To ${endDate}`, { align: "center", margin: 10 });

        doc.moveDown(); // Move down after the title

        const tableData = {
            headers: [
                "Order ID",
                "Address",
                "Quantity",
                "order Status",
                "Total"
            ],
            rows: orderDetails.map((order) => {
                return [
                    order?._id,
                    order.address?.homeAddress + "\n " + order.address?.areaAddress + "\n " + "Pincode :" + order.address?.pincode,
                    order?.totalQuantity,
                    order?.orderStatus,
                    'Rs ' + order?.totalPrice,
                ]
            }),
        };

        // Customize the appearance of the table
        await doc.table(tableData, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
            prepareRow: (row, i) => doc.font("Helvetica").fontSize(8),
            hLineColor: '#b2b2b2', // Horizontal line color
            vLineColor: '#b2b2b2', // Vertical line color
            textMargin: 2, // Margin between text and cell border
        });

        // Finalize the PDF document
        doc.end();

    } catch (err) {
        console.error(`Error on downloading PDF sales report: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


module.exports = {
    dashboardRender,
    salesRender,
    customSalesReportGet,
    customSalesReport,
    trendingProducts,
    downloadPdfReport,

}
