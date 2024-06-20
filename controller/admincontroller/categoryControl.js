const categorySchema = require('../../model/categorySchema')

const categoryRender = async (req, res) => {
    try {
        const categorys=await categorySchema.find().sort({createdAt:-1})

        res.render('admin/category', { title: 'category',categorys, alertMessage: req.flash('errorMessage') })
    } catch (err) {
        console.log(`Error on category render get ${err}`);
    }
}


const addCategoryPost = async (req, res) => {
    try {
        let categoryBody = req.body.categoryName;
        let category=categoryBody.toLowerCase();
        let actualCategory=category.trim()

        //validate category 
        if (!actualCategory) {
            req.flash('errorMessage', "Category not found please try again")
            return res.redirect('/admin/category')
        }

        // if the category exist 
        const categoryDetails=await categorySchema.findOne({categoryName:actualCategory})
        if(categoryDetails){
            req.flash('errorMessage','Category exist')
            return res.redirect('/admin/category')
        }
        
        // add to the category collection
        const newCategory = new categorySchema({
            categoryName: actualCategory
        })
        
        await newCategory.save()
        req.flash('errorMessage','Category Added Successfully')
        res.redirect('/admin/category')

    } catch (error) {
        console.log(`Error on add category post ${error}`)
    }
}

const deleteCategory=async(req,res)=>{
    try {
        const categoryID=req.params.categoryID
        if(!categoryID){
            return res.status(404).json({message:"Category id not found"})
        }
        const deletedCategory=await categorySchema.findByIdAndDelete(categoryID)

        if(deletedCategory){
            return res.status(200).json({message:"Category deleted"})
        }
    } catch (err) {
        
    }
}

const blockCategory=async(req,res)=>{
    try {
        const categoryID=req.params.categoryID
        if(!categoryID){
            return res.status(404).json({message:"Category id not found"})
        }
        
        const blockedCategory=await categorySchema.findByIdAndUpdate(categoryID,{isBlocked:true})
        
        if(blockedCategory){
            return res.status(200).json({message:"Category blocked"})
        }
        
    } catch (err) {
        console.log("Error on blocking the category",err);
    }
}


const unblockCategory=async(req,res)=>{
    try {
        const categoryID=req.params.categoryID
        if(!categoryID){
            return res.status(404).json({message:"Category id not found"})
        }
        
        const unblockedCategory=await categorySchema.findByIdAndUpdate(categoryID,{isBlocked:false})
        
        if(unblockedCategory){
            return res.status(200).json({message:"Category unblocked"})
        }
        
    } catch (err) {
        console.log("Error on unblocking the category",err);
    }
}



const editCategory=async(req,res)=>{
    try {

        const categoryID=req.params.categoryID

        if(!categoryID){
           req.flash('errorMessage',"Category id not found")
           return res.redirect('/admin/category')
        }
        
        const newCategoryName=req.body.editcategoryName.trim().toLowerCase()

        const checkCategory=await categorySchema.findOne({categoryName:newCategoryName})

        //check whether it already exists in the database or not
        if(checkCategory){
            req.flash('errorMessage',"Category Already exist")
            return res.redirect('/admin/category')
         }
        //add the new updations
        const editedCategory=await categorySchema.findByIdAndUpdate(categoryID,{categoryName:newCategoryName})
        
        if(editedCategory){
            req.flash('errorMessage',"Category name edited")
            return res.redirect('/admin/category')
        }

        
    } catch (err) {
        console.log("Error on editing category ",err);
    }
}

module.exports = {
    categoryRender,
    addCategoryPost,
    deleteCategory,
    blockCategory,
    unblockCategory,
    editCategory
}