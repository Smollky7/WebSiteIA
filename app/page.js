'use client';

import { useState } from 'react';
import Image from "next/image";
import { Header } from "@/components/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";

export default function Home() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setMessage('Por favor, insira um email válido.');
      return;
    }
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('https://api.sheetmonkey.io/form/tHc5MoFn6Fu5gAET62Cz46', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Email: email }),
      });

      if (response.ok) {
        setMessage('Inscrição realizada com sucesso!');
        setEmail(''); // Limpa o campo de email após o envio bem-sucedido
        setTimeout(() => {
          setMessage('');
        }, 1000); // Limpa a mensagem após 3 segundos
      } else {
        setMessage('Erro ao inscrever. Tente novamente.');
      }
    } catch (error) {
      setMessage(`Erro ao inscrever: ${error.message}`);
    }

    setIsLoading(false);
  };
  const validateEmail = (email) => {
    // Expressão regular para validar email
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <section className="w-full py-4 sm:py-8 md:py-16 lg:py-24 xl:py-36">
            <div className="container px-4 md:px-6">
              <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_450px]">
                <Image
                  alt="Herói de IA"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                  height="550"
                  src="https://i.gifer.com/XDZT.gif"
                  width="550"
                />
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                      Bem-vindo ao seu próximo assistente virtual!
                    </h1>
                    <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                      Experimente o futuro da IA com seu mais novo assistente virtual com serviços inovadores de geração de imagens e chat.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
            <div className="container mx-auto flex flex-col items-center justify-center gap-4 px-4 text-center md:px-6">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Pronto para experimentar o futuro da IA?
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Inscreva-se agora para atualizações futuras do sistema de geração de imagens de IA e chatbot.
                </p>
              </div>
              <div className="mx-auto w-full max-w-sm space-y-2">
                <form className="flex space-x-2" onSubmit={handleSubmit}>
                  <Input
                    className="max-w-lg flex-1"
                    placeholder="Digite seu e-mail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Enviando...' : message ? 'Enviado!' : 'Inscreva-se'}
                  </Button>
                </form>
                {message && <p>{message}</p>}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
