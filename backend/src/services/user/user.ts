import bcryptjs from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import { Address } from "../../interfaces/IAddress";
import { IUser } from "../../models/userModel";
import { SearchParams } from "../../interfaces/User/user";
import { IUserRepository } from "../../interfaces/Repository/IUserRepository";
import { IUserService } from "../../interfaces/Service/IUserService";


export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<string> {
    if (!userId) {
      throw new Error("User ID is required.");
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new Error("All fields are required.");
    }
    if (newPassword !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const isMatch = await bcryptjs.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error("Current password is incorrect.");
    }

    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(newPassword, salt);
    await this.userRepository.updateUser(user);

    return "Password changed successfully.";
  }
  async getProfile(userId: string) {
    const userData = await this.userRepository.findByIdWithoutPassword(userId);
    if (!userData) {
      throw new Error("User not found");
    }
    return userData;
  }
  async updateProfile(
    userId: string,
    name: string,
    phone: string,
    address: string,
    dob: string,
    gender: string,
    imageFile?: Express.Multer.File,
    medicalHistory?: string
  ): Promise<{ message: string }> {
    if (!userId || !name || !phone || !address || !dob || !gender) {
      throw new Error("Enter details in all missing fields");
    }
    const parsedAddress = JSON.parse(address) as Address;

    const updateData: Partial<IUser> = {
      name,
      phone,
      address: parsedAddress,
      dob,
      gender,
    };

    if (medicalHistory) {
      updateData.medicalHistory = medicalHistory;
    }

    await this.userRepository.updateProfile(userId, updateData);

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageURL = imageUpload.secure_url;
      await this.userRepository.updateProfile(userId, { image: imageURL });
    }

    return { message: "Profile updated" };
  }
  async getWalletBalance(userId: string): Promise<number> {
    return await this.userRepository.getWalletBalance(userId);
  }
  async searchDoctors(params: SearchParams) {
    const { speciality, search, sortBy, page = "1", limit = "8" } = params;
    let query: any = {};

    if (speciality) {
      query.speciality = speciality;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { speciality: { $regex: search, $options: "i" } },
      ];
    }

    let sortOptions: any = {};
    if (sortBy === "availability") {
      query.available = true;
    } else if (sortBy === "fees") {
      sortOptions.fees = 1;
    } else if (sortBy === "experience") {
      sortOptions.experience = -1;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 8;
    const skip = (pageNum - 1) * limitNum;

    const doctors = await this.userRepository.searchDoctors(
      query,
      sortOptions,
      skip,
      limitNum
    );
    const totalDoctors = await this.userRepository.countDoctors(query);

    return {
      totalPages: Math.ceil(totalDoctors / limitNum),
      currentPage: pageNum,
      totalDoctors,
      doctors,
    };
  }
}
