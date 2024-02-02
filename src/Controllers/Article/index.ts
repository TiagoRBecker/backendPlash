import { Response, Request } from "express";
import prisma from "../../server/prisma";

class Article {
  //Funçao para tratar dos erros no servidor
  private handleError(error: any, res: Response) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
  //Função para desconetar o orm prisma
  private async handleDisconnect() {
    return await prisma?.$disconnect();
  }
  //Retorna todas as categorias
  async getAllArticle(req: Request, res: Response) {
    try {
      const getMagazine = await prisma?.article.findMany({
        include: {
          magazine: true,
          Category:true,
        },
      });

      return res.status(200).json(getMagazine);
    } catch (error) {
      console.log(error);
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  //Retorna uma categoria especifica
  async getOneArticle(req: Request, res: Response) {
    const { slug } = req.params;

    try {
      const getArticle = await prisma?.article.findUnique({
        where: { id: Number(slug) },
      });

      return res.status(200).json(getArticle);
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }

  //Cria uma categoria
  async createArticle(req: Request, res: Response) {
    const {
      author,
      company,
      name,
      description,
      price,
      volume,
      categoryId,
      magazineId,
      status
    } = req.body;

    const {cover_file, pdf_file } = req.files as any
    const pdf = pdf_file[0]?.location
    const cover = cover_file[0]?.location
    try {
      const createArticle = await prisma?.article.create({
        data: {
          author,
          company,
          name,
          description,
          articlepdf:pdf,
          price:Number(price),
          volume,
          cover:cover,
          magazineId:Number(magazineId),
          categoryId:Number(categoryId),
          status:status
        },
      });
      return res.status(200).json({ message: "Categoria criada com sucesso!" });
    } catch (error) {
       console.log(error)
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  //Atualiza uma categoria especifica
  async updateArticle(req: Request, res: Response) {
    const { slug} = req.params;
    const {
      author,
      company,
      name,
      description,
      price,
      volume,
      categoryId,
      magazineId,
      status
    } = req.body;

    const {cover_file, pdf_file } = req.files as any
    const pdf = pdf_file[0]?.location
    const cover = cover_file[0]?.location
    if (!slug) {
      return res
        .status(404)
        .json({ message: "Não foi possivel atualizar o imóvel!" });
    }
    try {
      const updateArticle = await prisma?.article.update({
        where: {
          id: Number(slug),
        },
        data: {
          author,
          company,
          name,
          description,
          articlepdf:pdf,
          price:Number(price),
          volume,
          cover:cover,
          magazineId:Number(magazineId),
          categoryId:Number(categoryId),
          status:status
        },
       
      });
      return res
        .status(200)
        .json({ message: "Categoria atualizada com sucesso!" });
    } catch (error) {
      return this.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
  //Delete uma categoria especifica
  async deleteArticle(req: Request, res: Response) {
    const { id } = req.body;
    if (!id) {
      return res
        .status(403)
        .json({ message: "Não foi possível encontrar a categoria!" });
    }
    try {
      const deletMagazine = await prisma?.article.delete({
        where: {
          id: Number(id),
        },
      });
      return res
        .status(200)
        .json({ message: "Categoria deletado com sucesso!" });
    } catch (error) {
      return this?.handleError(error, res);
    } finally {
      return this?.handleDisconnect();
    }
  }
}

const ArticleController = new Article();
export default ArticleController;
