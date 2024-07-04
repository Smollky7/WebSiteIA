// app/image-generator/page.jsx
"use client";
import React, { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { Puff } from "react-loader-spinner";
import { Label } from "@/components/ui/label";
import {
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
  Select,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import Footer from "@/components/footer";

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [promptError, setPromptError] = useState("");
  const [selectedModel, setSelectedModel] = useState("playground-v2");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("1:1");
  const [imageUrl, setImageUrl] = useState("/placeholder.svg");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGenerateClick = async () => {
    if (!prompt.trim()) {
      setPromptError("Please enter a creative prompt.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://visionaryaibackend.onrender.com/api/images/generate",
        {
          prompt,
          modelName: selectedModel,
          aspectRatio: selectedAspectRatio,
        }
      );

      if (response.data && response.data.length > 0) {
        setImageUrl(response.data[0]);
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setPrompt(e.target.value);
    if (promptError) setPromptError("");
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const localUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = localUrl;
      link.setAttribute(
        "download",
        `GeneratedImage-${new Date().toISOString()}.png`
      );

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(localUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // Função auxiliar para calcular dimensões baseadas no aspectRatio selecionado
  const calculateDimensions = () => {
    switch (selectedAspectRatio) {
      case "1:1":
        return { width: 412, height: 412 };
      case "9:16":
        return { width: 412, height: 231 };
      case "16:9":
        return { width: 412, height: 232 };
      default:
        return { width: 412, height: 412 }; // Valor padrão
    }
  };

  return (
    <>
      <Header />
      <main className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-4xl font-bold mb-4">Gerador de imagens</h1>

        <section className="w-full max-w-2xl mb-8 flex justify-center">
          {isLoading ? (
            <Puff color="#00BFFF" height={100} width={100} />
          ) : (
            <div onClick={toggleModal} className="cursor-pointer">
              <Image
                alt=""
                className="aspect-square object-cover border border-gray-200 rounded-lg overflow-hidden dark:border-gray-800"
                src={imageUrl}
                onContextMenu={(e) => e.preventDefault()}
                width={calculateDimensions().width}
                height={calculateDimensions().height}
              />
            </div>
          )}
        </section>

        {/* Modal para visualização em tamanho real */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-start pt-10"
            onClick={toggleModal}
          >
            <div
              className="relative w-full h-[50vh] p-10"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                alt="Imagem gerada em tamanho real"
                src={imageUrl}
                layout="fill"
                objectFit="contain"
                className="rounded-lg"
                onContextMenu={(e) => e.preventDefault()}
              />
              <button
                onClick={toggleModal}
                className="absolute right-10 top-1 text-white bg-black p-2 rounded-full hover:bg-opacity-80 focus:outline-none focus:ring z-50"
                style={{ boxShadow: "0 2px 4px rgba(0, 0, 0, 0.5)" }}
              >
                &times;
              </button>
            </div>
          </div>
        )}

        <div className="w-full max-w-md mb-4">
          <Label htmlFor="aspectRatio">Tamanho da imagem</Label>
          <Select
            id="aspectRatio"
            value={selectedAspectRatio}
            onValueChange={setSelectedAspectRatio}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={selectedAspectRatio} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1:1">1:1</SelectItem>
              <SelectItem value="9:16">9:16</SelectItem>
              <SelectItem value="16:9">16:9</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full max-w-md mb-4">
          <Label htmlFor="prompt">Escreva aqui</Label>
          <input
            id="prompt"
            placeholder="Descreva o que você deseja..."
            type="text"
            value={prompt}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
          {promptError && (
            <div style={{ color: "red", marginTop: "4px", fontSize: "12px" }}>
              {promptError}
            </div>
          )}
        </div>

        <Button
          className="mb-4 px-6 py-2 text-white font-bold rounded transition duration-300 ease-in-out bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-opacity-50 disabled:opacity-50"
          onClick={handleGenerateClick}
          disabled={isLoading}
        >
          Gerar
        </Button>

        {imageUrl !== "/placeholder.svg" && (
          <Button variant="outline" onClick={handleDownload}>
            Download
          </Button>
        )}

        <Footer />
      </main>
    </>
 

  );
}
    