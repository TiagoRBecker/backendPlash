import { Router, Request, Response } from "express";
import CategoriesController from "../Controllers/Categories";
import ArticleController from "../Controllers/Article";
import MagazineController from "../Controllers/Magazine/index";
import { multerConfig } from "../utils/multerConfig";
import path from "path";
import { chekingToken } from "../Middleware";
import { setTempHashCookie } from "../Middleware/authorizeHash";
import DvlController from "../Controllers/DVL";
import GatwayPayment from "../Controllers/MercadoPago";
import {WebHook,CreateOrder} from "../Controllers/MercadoPago";

const route = Router();
//Categories
route.get("/categories", CategoriesController.getAllCategories);
route.get("/category/:slug", CategoriesController.getOneCategory);
route.post("/category/:slug", CategoriesController.updateCategory);
route.post("/create-category", CategoriesController.createCategory);
route.delete("/delet-category", CategoriesController.deleteCategory);
//Article
route.post("/create-article",multerConfig.fields([{ name: "cover_file", maxCount: 1 },{ name: "pdf_file", maxCount: 1 },]),ArticleController.createArticle);
route.get("/articles", ArticleController.getAllArticle);
route.post("/update-article/:slug", multerConfig.fields([{ name: "cover_file", maxCount: 1 },{ name: "pdf_file", maxCount: 1 },]),ArticleController.updateArticle);
route.get("/article/:slug", ArticleController.getOneArticle);
route.delete("/delet-article", ArticleController.deleteArticle);
//Magazine
route.get("/magazines", MagazineController.getAllMagazine);
route.get("/magazine/:slug", MagazineController.getOneMagazine);
route.post(
  "/create-magazine",
  multerConfig.fields([
    { name: "cover_file", maxCount: 1 },
    { name: "pdf_file", maxCount: 1 },
  ]),
  MagazineController.createMagazine
);
route.post(
  "/update-magazine/:slug",
  multerConfig.fields([
    { name: "cover_file", maxCount: 1 },
    { name: "pdf_file", maxCount: 1 },
  ]),
  MagazineController.updateMagazine
);
route.delete("/delet-magazine", MagazineController.deleteMagazine);
//End UserMaster

//Uploads

export default route;
route.post("/read", async (req: Request, res: Response) => {
  const { nameBook } = req.body;

  if (nameBook) {
    const getBook = await prisma?.magazine.findMany({
      where: {
        name: nameBook,
      },
      select: {
        magazine_pdf: true,
      },
    });

    return res.status(200).json(getBook);
  }
});
route.post("/user/:slug",  async (req, res) => {
     const { slug} = req.params
     const { dvl,pay} = req.body
     
      const someValues = dvl.map((items:any)=> Number(items.paidOut) - Number(pay))
      
   try {
    const dvls = await prisma?.dvl.updateMany({
      where:{
        name:slug
      },
      data:{
        toReceive:{
          increment:Number(pay)
        },
        paidOut:{
          decrement:Number(pay)
        }
      }
    })
     console.log(dvls)
     return res.status(200).json(dvls)
   } catch (error) {
     console.log(error)
    return res.status(500).json({message:"Erro"})
   }
   
   
  
   
});
route.get("/user/:slug",  async (req, res) => {
     const { slug} = req.params
  try {
    const user = await prisma?.user.findUnique({
      where:{
        id:Number(slug)
      },
      select:{
        name:true,
        orders:{
          include:{
            dvl:true
          }
        }
        
      },
    
        
      
    })
  

    return res.status(200).json(user)
  } catch (error) {
    console.log(error)
   return res.status(500).json({message:"Erro"})
  }
 
  
});

route.get("/user",  async (req, res) => {
   
  try {
   const dvls = await prisma?.dvl.findMany({
    distinct: ['name'],
      orderBy: {
        name: 'asc', // Ordena por nome para garantir consistência nos resultados
      },
      include:{
        user:true
      }
   })

    return res.status(200).json(dvls)
  } catch (error) {
    console.log(error)
   return res.status(500).json({message:"Erro"})
  }
 
  
});
route.get("/user-dvl",DvlController.getAllCategories)

//payment 
route.post("/payment",GatwayPayment)
route.post("/webhook",WebHook)
route.get("/order",CreateOrder)
//Payemnts and Orders

route.get("/order",CreateOrder)