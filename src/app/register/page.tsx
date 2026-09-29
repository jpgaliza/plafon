import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Criar Conta | Plafon",
  description: "Crie sua conta no Plafon e assuma o controle do seu dinheiro.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
