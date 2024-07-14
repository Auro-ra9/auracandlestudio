const orderSchema=require('../../model/orderSchema')


const dashboardRender =async (req, res) => {
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

        // find the number of payment methods
        let payByCash=0
        let payByRazorPay=0
        let payByWallet=0

        orderDetailsProfit.forEach((order)=>{
            if(order.paymentMethod==='Cash on delivery'){
                payByCash++;
            }
            if(order.paymentMethod==='Razor pay'){
                payByRazorPay++;
            }
            if(order.paymentMethod==='Wallet'){
                payByWallet++;
            }
        })

        const paymentMethodChart=[payByCash,payByRazorPay,payByWallet]


        res.render('admin/dashboard', {
            title: "Admin Dashboard",
            alertMessage: req.flash('errorMessage'),
            dailyReport,
            weeklyReport,
            monthlyReport,
            overallSalesAmount,
            overallSalesCount,
            overallDiscount,
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
        const orders = await orderSchema.find({ createdAt: { $gte: start, $lte: end },isCancelled:false });

        // Calculate total sales
        const sale = orders.reduce((acc, order) => acc + order.totalPrice, 0);
        return res.status(200).json({ success: "Report Generated", salesReport:sale });
    } catch (err) {
        console.error(`Error on generating custom sales report: ${err}`);
        return res.status(500).json({ error: "Internal server error" });
    }
};


module.exports = {
    dashboardRender,
    customSalesReport
}
