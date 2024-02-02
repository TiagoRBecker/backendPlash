import { Request, Response, response } from "express";
import { MercadoPagoConfig, Payment, Preference ,} from "mercadopago";
const mercadoPago = new MercadoPagoConfig({
  accessToken:"TEST-5209000350365804-012112-78908f97b5f3d4d1b9b3627c2e1676f9-1440745780",
 
});
const preference = new Preference(mercadoPago);
const payment = new Payment(mercadoPago);
const GatwayPayment = async (req: Request, res: Response) => {
 
              



  const {book} = req.body;
  const items = book.map((items: any) => {
    return {
      id: items.id,
      title: items.title,
      unit_price: items.price,
      currency_id: "BRL",
      picture_url:"https://nova-escola-producao.s3.amazonaws.com/9jwdcjASGFYN5GAaDFGYSexYQpTNTHzJ9CWPAwRse8A4CBK3FchguH28ECBX/ne326-arevista-01.jpg",
      quantity: items.qtd,
    };
  });


  try {
   
    

    const createPreference = await preference.create({
      body: {
      
        back_urls: {
          success: "http://localhost:3000/sucess",
          failure: "http://localhost:3000/failure",
        },
        items: items,
        
        payment_methods:{
            installments:4,
            excluded_payment_types:[
                {
                    id: "ticket"
                }
            ]
        },
        auto_return:"approved",
        metadata:{
          userID:1,
          products:items

        }
  
    
       
      },
    }) ;
   
  
 
    return res.status(200).json({id:createPreference.id});
  } catch (error) {
    console.log(error);
  }
};
export const WebHook = async (req: Request, res: Response) => {
           
 const {data} = req.body
 try {
  if(data.id){

    const getStatus = await payment.get({id:data.id})
     const satusPayment =  getStatus.status
     const metadata = getStatus.metadata
     const dvlItems = getStatus.metadata.products.map((items:any)=>{
      return {
       
        name:items.title,
        price:items.unit_price,
        toReceive:0,
        picture:items.picture_url,
        paidOut:items.unit_price
      }
     })
     if(satusPayment === "approved"){
      const createOrder = await prisma?.order.create({
        data:{
          status:satusPayment,
          items:metadata.products,
          userId:metadata.user_id,
          dvl:{
            create:dvlItems

            
          }
        }
      })
      console.log(createOrder)
      return res.status(200).json({message:"Order criada com sucesso"})
     }
      
  }
 } catch (error) {
   console.log(error)
 }


};

export const CreateOrder = async (req: Request, res: Response) => {
  const gtOrder = await payment.get({id:"1320964195"})
  console.log(gtOrder.metadata)
  return res.status(200).json(gtOrder)
}
export default GatwayPayment;
