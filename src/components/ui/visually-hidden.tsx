"use client";

import { Root } from "@radix-ui/react-visually-hidden";
import type * as React from "react";

function VisuallyHidden({ ...props }: React.ComponentProps<typeof Root>) {
  return <Root {...props} />;
}

export { VisuallyHidden };
