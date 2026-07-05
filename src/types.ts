/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AppModel {
  id: string;
  title: string;
  tagline: string;
  description: string;
  launchUrl?: string;
  iconName: string;
  category: "utility" | "creative" | "developer";
  features: string[];
}

export interface BookModel {
  id: string;
  title: string;
  author: string;
  publishedYear: string;
  genre: string;
  coverColor: string; // Tailind bg gradient class
  description: string;
  pages: number;
  sampleChapters: { title: string; paragraphs: string[] }[];
}

export interface TrackModel {
  id: string;
  title: string;
  album: string;
  duration: string;
  type: "ambient" | "lofi" | "synth";
  frequency?: number; // Base synth frequency (Hz)
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface CustomProject {
  id: string;
  type: "apps" | "books" | "music" | "outros" | "photos" | "videos";
  title: string;
  desc?: string;
  link?: string;
  publishedAt: string;
  fileName?: string;
  fileSize?: string;
  fileData?: string;
  coverImageName?: string;
  coverImageData?: string;
  allowDownload?: boolean;
}
