import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!image || !(image instanceof File)) {
      return NextResponse.json(
        { error: "请上传图片" },
        { status: 400 }
      );
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "服务器未配置 Remove.bg API Key" },
        { status: 500 }
      );
    }

    // Prepare form data for Remove.bg API
    // Note: Remove.bg expects "image_file" as the field name
    const removeBgFormData = new FormData();
    removeBgFormData.append("image_file", image, image.name);
    removeBgFormData.append("size", "auto");

    // Call Remove.bg API
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: removeBgFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Remove.bg API error:", errorText);
      
      // Parse error message
      let errorMessage = "Remove.bg API 调用失败";
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.errors && errorJson.errors[0]) {
          errorMessage = errorJson.errors[0].title || errorMessage;
        }
      } catch {
        // Keep default message if parsing fails
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // Return the processed image
    const blob = await response.blob();
    
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="no-bg.png"',
      },
    });
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      { error: "处理失败，请重试" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}