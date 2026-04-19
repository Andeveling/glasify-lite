import { chatRouter } from "@/server/api/routers/admin/chat"
import { clientsRouter } from "@/server/api/routers/admin/clients"
import { colorsRouter } from "@/server/api/routers/admin/colors"
import { designTemplateRouter } from "@/server/api/routers/admin/design-template"
import { galleryRouter } from "@/server/api/routers/admin/gallery"
import { glassSolutionRouter } from "@/server/api/routers/admin/glass-solution"
import { glassSupplierRouter } from "@/server/api/routers/admin/glass-supplier"
import { glassTypeRouter } from "@/server/api/routers/admin/glass-type"
import { modelRouter } from "@/server/api/routers/admin/model"
import { modelColorsRouter } from "@/server/api/routers/admin/model-colors"
import { profileSupplierRouter } from "@/server/api/routers/admin/profile-supplier"
import { serviceRouter } from "@/server/api/routers/admin/service"
import { createTRPCRouter } from "@/server/api/trpc"

export const adminRouter = createTRPCRouter({
  chat: chatRouter,
  clients: clientsRouter,
  colors: colorsRouter,
  "design-template": designTemplateRouter,
  gallery: galleryRouter,
  "glass-solution": glassSolutionRouter,
  "glass-supplier": glassSupplierRouter,
  "glass-type": glassTypeRouter,
  model: modelRouter,
  "model-colors": modelColorsRouter,
  "model-upsert": modelRouter.upsert,
  "profile-supplier": profileSupplierRouter,
  service: serviceRouter,
})
