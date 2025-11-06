import OpenAi from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary here
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const AI = new OpenAi({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export const generateArticle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Free usage limit exceeded. Please upgrade to premium plan." });
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                { role: "user", content: prompt },
            ],
            max_tokens: length,
            temperature: 0.7,
        });

        const content = response.choices[0].message.content;

        await sql`INSERT INTO creations (user_id, prompt, content,type) VALUES (${userId}, ${prompt}, ${content}, 'article')`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1 // increment free usage count
                }
            });
        }

        res.json({ success: true, content });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Free usage limit exceeded. Please upgrade to premium plan." });
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                { role: "user", content: prompt },
            ],
            max_tokens: 100,
            temperature: 0.7,
        });

        const content = response.choices[0].message.content;

        await sql`INSERT INTO creations (user_id, prompt, content,type) VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1 // increment free usage count
                }
            });
        }

        res.json({ success: true, content });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const generateImage = async (req, res) => {
    try {
        console.log("req.plan:", req.plan); // Add this line
        const { userId } = req.auth();
        const { prompt, publish } = req.body;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium users" });
        }

        const formData = new FormData()
        formData.append('prompt', prompt);

        const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY
            },
            responseType: 'arraybuffer'
        });


        const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;

        const { secure_url } = await cloudinary.uploader.upload(base64Image)

        await sql`INSERT INTO creations (user_id, prompt, content,type,publish) VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

        res.json({ success: true, content: secure_url });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const removeImageBackground = async (req, res) => {
    try {
        console.log("req.plan:", req.plan);
        const { userId } = req.auth();
        const image = req.file;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium users" });
        }

        console.log("Uploading image:", image.path);

        const result = await cloudinary.uploader.upload(image.path, {
            background_removal: "cloudinary_ai"
        });

        console.log("Cloudinary result:", result);

        // Generate the transformed URL with background removed
        const transformedUrl = cloudinary.url(result.public_id, {
            effect: "bgremoval",
            format: "png" // PNG to support transparency
        });

        console.log("Transformed URL:", transformedUrl);

        await sql`INSERT INTO creations (user_id, prompt, content,type) VALUES (${userId}, 'Remove Background from image', ${transformedUrl}, 'image')`;

        res.json({ success: true, content: transformedUrl });
    } catch (error) {
        console.log("Full error:", error);
        console.log("Error response:", error.error);
        res.json({ success: false, message: error.message });
    }
}

export const removeImageObject = async (req, res) => {
    try {
        console.log("req.plan:", req.plan); // Add this line
        const { object } = req.body;
        const { userId } = req.auth();
        const  image  = req.file;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium users" });
        }

        const { public_id } = await cloudinary.uploader.upload(image.path);

        const imageUrl = cloudinary.url(public_id, {
            transformation: [{
                effect: `gen_remove:${object}`,
            }],
            resource_type: "image",
        })

        await sql`INSERT INTO creations (user_id, prompt, content,type) VALUES (${userId}, ${`Removed ${object} from image `}, ${imageUrl}, 'image')`;

        res.json({ success: true, content: imageUrl });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export const resumeReview = async (req, res) => {
  try {
    console.log("req.plan:", req.plan);
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;

    if (plan !== 'premium') {
      return res.json({ success: false, message: "This feature is only available for premium users" });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({ success: false, message: "File size exceeds 5MB limit." });
    }

    const dataBuffer = fs.readFileSync(resume.path);
    
    // Load the PDF
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(dataBuffer),
      useSystemFonts: true,
    });
    
    const pdf = await loadingTask.promise;
    let text = '';
    
    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      text += pageText + '\n';
    }

    const prompt = `Review the following resume and provide feedback on its strengths, weakness and suggestions for improvement:\n\n${text}`;

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        { role: "user", content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Review the Uploaded Resume', ${content}, 'resume-review')`;

    res.json({ success: true, content });
  } catch (error) {
    console.log("Full error:", error);
    res.json({ success: false, message: error.message });
  }
}