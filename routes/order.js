const router = require("express").Router();
const { authenticateToken } = require("./userAuth");
const User = require("../models/user");
const Order = require("../models/order");
const Book = require("../models/book");

//Place order
router.post("/place-order", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const { order } = req.body;
    for (const orderData of order) {
      const newOrder = new Order({ user: id, book: orderData._id });
      const orderDataFromDb = await newOrder.save();

      //Saving order in user model
      await User.findByIdAndUpdate(id, {
        $push: { orders: orderDataFromDb._id },
      });

      //Clearing cart
      await User.findByIdAndUpdate(id, {
        $pull: { cart: orderData._id },
      });
    }

    return res.json({
      status: "Success",
      message: "Order Placed Successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred" });
  }
});


//Get order history of particular user
router.get("/get-order-history", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const userData = await User.findById(id).populate({
      path: "orders",
      populate: { path: "book" },
    });

    const ordersData = userData.orders.reverse();
    return res.json({
      status: "Success",
      data: ordersData,
    });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred" });
  }
});



//Get all orders--->admin
router.get("/get-all-orders", authenticateToken, async (req, res) => {
  try {
    const userData = await Order.find()
      .populate({
        path: "book",
      })
      .populate({
        path: "user",
      })
      .sort({
        createdAt: -1,
      });

    return res.json({
      status: "Success",
      data: userData,
    });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred" });
  }
});


//update order status -- admin
router.put("/update-status/:id", authenticateToken, async(req,res)=>{
    try{
        const {id} = req.params
        await Order.findByIdAndUpdate(id, {status:req.body.status})
        return res.json({
            status: "Success",
            message: "Status Updated Successfully"

        })
    }
    catch (error) {
        return res.status(500).json({ message: "An error occurred" });
      }
})

module.exports = router;