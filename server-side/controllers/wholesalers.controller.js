import Wholesaler from '../models/wholesalers.model.js';
import fs from "fs";
import cloudinary from "./cloudinary.controller.js";
import nodemailer from "nodemailer";
import mongoose from "mongoose";

// Helper to generate unique code
const generateUniqueCode = async () => {
    let code;
    do {
        const randomString = Math.random().toString(36).slice(2, 9);
        const digitCount = (randomString.match(/\d/g) || []).length;
        if (digitCount >= 2 && digitCount <= 3) {
            code = 'NPK_WS_' + randomString;
        }
    } while (!code || await Wholesaler.exists({ code }));
    return code;
};

// Function to dynamically create a new database using user.code
const createDatabase = async (dbName, wholesalerData) => {
    try {
        const DB_URL = process.env.DB_URL;
        const dbURI = DB_URL.replace("npk_interior", dbName);
        const newDbConnection = mongoose.createConnection(dbURI);

        // Define the "users" schema
        const ShopAccountSchema = new mongoose.Schema({
            shopName: String,
            gstNumber: {type:String, unique: true},
            panNumber: {type:String, unique: true},
            bankAccountNumber: {type:String, unique: true},
            bankHolderName: String,
            bankName: String,
            IFSCCode: String,
            createdOn: { type: Date, default: Date.now },
            updatedOn: { type: Date, default: Date.now },
        });

        // Create the "account_detail" collection
        const ShopAccountModel = newDbConnection.model('account_detail', ShopAccountSchema);

        // Insert the first SHOP account record
        await ShopAccountModel.insertOne({
            shopName: wholesalerData.shopName,
            panNumber: wholesalerData.panNumber,
            gstNumber: wholesalerData.gstNumber,
            bankHolderName: wholesalerData.name,
            bankAccountNumber: wholesalerData.bankAccountNumber,
            bankName: wholesalerData.bankName,
            IFSCCode: wholesalerData.IFSCCode,
            createdOn: new Date(),
            updatedOn: new Date(),
        });

        console.log(`Database '${dbName}' created with 'account_detail' collection and initial wholesaler record.`);
        return newDbConnection;
    } catch (error) {
        console.error(`Failed to create database '${dbName}':`, error);
        throw error;
    }
};


// Reuse transporter (faster)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Email sender
const sendInvitationToWholesaler = async (wholesaler) => {
    const currentYear = new Date().getFullYear();
    const profilePic = wholesaler.images?.[0]?.key || 'https://digitalhealthskills.com/wp-content/uploads/2022/11/3da39-no-user-image-icon-27.png'; // fallback image

    const mailOptions = {
        from: `"NPK Interior" <${process.env.EMAIL_USER}>`,
        to: wholesaler.email,
        subject: `🎉 Welcome to NPK Interior, ${wholesaler.name}!`,
        html: `
        <div style="max-width: 600px; margin: auto; background: #f8f8f8; border-radius: 10px; padding: 20px; border: 1px solid #ccc; font-family: Arial, sans-serif;">
            <div style="text-align: center;">
                <img src="https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/image8-2.jpg?width=600&name=image8-2.jpg" alt="NPK Interior Logo" style="width: 80px; margin-bottom: 20px;">
            </div>
            <h2 style="color: #333; text-align: center;">Welcome to the NPK Interior Family, <span style="color: #222;">${wholesaler.name}</span>! 🎉</h2>
            <p style="font-size: 16px; color: #555; text-align: center;">We're excited to have you on board!</p>

            <!-- Profile Card -->
            <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin: 20px auto; max-width: 400px;">
                <div style="text-align: center;">
                    <img src="${profilePic}" alt="Profile Picture" style="width: 100px; height: 100px; object-fit: cover; border-radius: 50%; border: 2px solid #ddd; margin-bottom: 10px;">
                </div>
                <h3 style="text-align: center; color: #333; margin: 10px 0;">${wholesaler.name}</h3>
                <p style="text-align: center; color: #777; margin: 5px 0;"><strong>Email:</strong> ${wholesaler.email}</p>
                <p style="text-align: center; color: #777; margin: 5px 0;"><strong>Phone:</strong> ${wholesaler.phone || 'N/A'}</p>
            </div>

            <p style="font-size: 14px; color: #555; text-align: center;">
                We look forward to collaborating with you and creating beautiful spaces together.
            </p>
            <p style="font-size: 14px; color: #555; text-align: center;">
                We will be in touch with you soon, For future invoices. This is your generated code: <span style="font-weight: bold;">${wholesaler.code}</span>
            </p>
            <div style="text-align: center; margin: 20px;">
                <a href="https://www.synycs.com/" style="background: linear-gradient(135deg, #444, #888); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 14px; font-weight: bold; box-shadow: 2px 2px 8px rgba(0,0,0,0.2);">
                    Visit Our Website
                </a>
            </div>
            <p style="font-size: 14px; color: #555; text-align: center;">If you have any questions, feel free to reach out to us anytime.</p>
            <p style="font-size: 14px; color: #555; text-align: center;">Cheers,</p>
            <p style="font-size: 12px; color: #444; text-align: center;"><strong>NPK Interior Team</strong></p>

            <div style="text-align: center; font-size: 12px; color: #777; margin-top: 20px;">
                <a href="mailto:npk@npkinterior.com" style="text-decoration: none; color: #777;">npk@npkinterior.com</a> | 
                <a href="tel:+919898989898" style="text-decoration: none; color: #777;">+91 9898989898</a>
            </div>

            <div style="text-align: center; margin-top: 10px; font-size: 12px;">
                <a href="https://www.synycs.com" style="text-decoration: none; font-weight: bold;">Visit Our Website</a> |
                <a href="https://www.synycs.com/contact.html" style="text-decoration: none; font-weight: bold;">Contact Us</a>
            </div>

            <hr style="border-top: 1px solid #ccc; margin: 20px 0;">
            <p style="font-size: 12px; color: #777; text-align: center;">&copy; ${currentYear} NPK Interior. All rights reserved.</p>
        </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Invitation sent to ${wholesaler.email}`);
        return true;
    } catch (error) {
        console.error('Error sending invitation email:', error);
        return false;
    }
};

// Main controller
export const addWholesaler = async (req, res) => {
    try {
        const wholesalersData = Array.isArray(req.body.wholesalers) ? req.body.wholesalers : [];

        if (wholesalersData.length === 0) {
            return res.status(400).json({ success: false, message: "No valid wholesalers found" });
        }

        // Check duplicate emails
        const duplicateEmails = await Wholesaler.find({
            email: { $in: wholesalersData.map(w => w.email.toLowerCase()) }
        }).lean();

        if (duplicateEmails.length > 0) {
            return res.status(400).json({ success: false, message: "Email already registered. Use a different email." });
        }

        // Group uploaded files by wholesaler index
        const filesByWholesalerIndex = {};
        if (req.files?.length > 0) {
            for (const file of req.files) {
                const match = file.fieldname.match(/^images-(\d+)$/);
                if (match) {
                    const index = parseInt(match[1]);
                    filesByWholesalerIndex[index] = filesByWholesalerIndex[index] || [];
                    filesByWholesalerIndex[index].push(file);
                }
            }
        }

        // Process and prepare wholesalers
        const wholesalersToSave = await Promise.all(
            wholesalersData.map(async (wholesaler, index) => {
                const files = filesByWholesalerIndex[index] || [];
                const code = await generateUniqueCode();

                await createDatabase(code, wholesaler);

                delete wholesaler.gstNumber;
                delete wholesaler.panNumber;
                delete wholesaler.bankName;
                delete wholesaler.bankAccountNumber;
                delete wholesaler.IFSCCode;

                // Upload images to Cloudinary
                const uploadedImages = await Promise.all(
                    files.map(async (file) => {
                        try {
                            const result = await cloudinary.uploader.upload(file.path, {
                                folder: `wholesalers/${code}`,
                                public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
                                resource_type: "image"
                            });

                            return {
                                name: file.originalname,
                                type: file.mimetype,
                                key: result.secure_url,
                                keyId: result.public_id
                            };
                        } finally {
                            fs.unlink(file.path, (err) => {
                                if (err) console.error('File delete error:', err);
                            });
                        }
                    })
                );

                return {
                    ...wholesaler,
                    code,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    createdBy: req.user.id,
                    updatedBy: req.user.id,
                    images: uploadedImages
                };
            })
        );

        // Insert all wholesalers
        const savedWholesalers = await Wholesaler.insertMany(wholesalersToSave);

        // Send invitation emails in parallel
        await Promise.all(savedWholesalers.map(sendInvitationToWholesaler));

        res.status(201).json({ success: true, wholesalers: savedWholesalers });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};

export const getWholesalerById = async (req, res) => {
    try {
        const wholesaler = await Wholesaler.findById(req.params.id, {}, { lean: true }).exec();
        res.json({ success: true, wholesaler });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
}

export const getWholesalers = async (req, res) => {
    try {
        const wholesalers = await Wholesaler.find({}, {}, { lean: true }).exec();
        res.json({ success: true, response: wholesalers, message: "Wholesalers fetched successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
}

export const updateWholesaler = async (req, res) => {
    try {
        const wholesaler = await Wholesaler.findByIdAndUpdate(req.params.id, req.body, { new: true, upsert: true }).exec();
        res.json({ success: true, wholesaler });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
}

export const deleteWholesaler = async (req, res) => {
    try {
        const wholesaler = await Wholesaler.findByIdAndDelete(req.params.id, {}, { lean: true }).exec();
        res.json({ success: true, wholesaler });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
}