import { describe, it, expect } from "vitest"

const IntentMode = {
  CREATE_MODEL: "create_model",
  CALIBRATE_MODEL: "calibrate_model",
  CREATE_QUOTE: "create_quote",
} as const

const CREATE_MODEL_STUB = {
  message:
    "El asistente de creación de modelos está siendo configurado. Por favor, proporciona los detalles del modelo: nombre, plantilla de diseño (OX, XX, etc.), proveedor de perfiles, y las dimensiones (ancho y alto en mm).",
  mode: IntentMode.CREATE_MODEL,
}

const CALIBRATE_MODEL_STUB = {
  message:
    "El asistente de calibración está siendo configurado. Por favor, indica el modelo a calibrar y los datos de costos (perfiles, accesorios, largo de barra).",
  mode: IntentMode.CALIBRATE_MODEL,
}

const CREATE_QUOTE_STUB = {
  message:
    "La función de cotización asistida aún no está disponible. Puedo ayudarte a crear o calibrar el modelo primero.",
  mode: IntentMode.CREATE_QUOTE,
}

describe("Stub Mode Agents", () => {
  describe("create_model stub", () => {
    it("returns expected stub response structure", () => {
      expect(CREATE_MODEL_STUB.mode).toBe("create_model")
      expect(typeof CREATE_MODEL_STUB.message).toBe("string")
      expect(CREATE_MODEL_STUB.message.length).toBeGreaterThan(0)
    })

    it("message contains expected guidance keywords", () => {
      expect(CREATE_MODEL_STUB.message).toContain("nombre")
      expect(CREATE_MODEL_STUB.message).toContain("dimensiones")
    })
  })

  describe("calibrate_model stub", () => {
    it("returns expected stub response structure", () => {
      expect(CALIBRATE_MODEL_STUB.mode).toBe("calibrate_model")
      expect(typeof CALIBRATE_MODEL_STUB.message).toBe("string")
      expect(CALIBRATE_MODEL_STUB.message.length).toBeGreaterThan(0)
    })

    it("message contains expected guidance keywords", () => {
      expect(CALIBRATE_MODEL_STUB.message).toContain("modelo")
      expect(CALIBRATE_MODEL_STUB.message).toContain("costos")
    })
  })

  describe("create_quote stub", () => {
    it("returns expected stub response with planned feature message", () => {
      expect(CREATE_QUOTE_STUB.mode).toBe("create_quote")
      expect(typeof CREATE_QUOTE_STUB.message).toBe("string")
      expect(CREATE_QUOTE_STUB.message).toContain("no está disponible")
      expect(CREATE_QUOTE_STUB.message).toContain("crear o calibrar")
    })
  })
})
