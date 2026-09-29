"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, PieChart, Zap, Target } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Spotlight } from "@/components/ui/spotlight";
import { FadeIn } from "@/components/ui/fade-in";
import { IPhoneCanvas } from "@/components/iphone-canvas";

export default function Home() {
  const t = useTranslations("Landing");
  const locale = useLocale();
  const isEn = locale.startsWith("en");
  const scrollTrackRef = useRef<HTMLDivElement>(null);

  // Tracks the scroll progress of the sticky section
  const { scrollYProgress } = useScroll({
    target: scrollTrackRef,
    offset: ["start start", "end end"],
  });

  // A animação termina em 80% do percurso. Os últimos 20% servem como "pausa" com o celular no centro.
  const iphoneScrollProgress = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

  return (
    <>
      {/* Fixed background dot grid — always behind everything */}
      <Spotlight />

      <div className="relative min-h-screen bg-transparent text-foreground overflow-x-clip selection:bg-accent-blue/30">
        {/* Navbar */}
        <nav className="relative z-20 flex items-center justify-between px-6 py-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center font-bold text-xl">
              <span className="absolute top-0 right-1 h-[3px] w-4 bg-accent-blue" />
              <span className="absolute left-1 bottom-1 h-6 w-[3px] bg-foreground" />
              <span className="absolute left-1 top-1 h-[3px] w-4 bg-foreground" />
              <span className="absolute right-1 top-1 h-4 w-[3px] bg-foreground" />
              <span className="absolute left-1 bottom-[10px] h-[3px] w-4 bg-foreground" />
            </div>
            <span className="font-semibold text-lg tracking-tight">Plafon</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("login")}
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform hover:scale-105"
            >
              {t("getStarted")}
            </Link>
          </div>
        </nav>

        <main className="relative">
          {/* Unified Sticky Scroll Section: Hero Text + 3D iPhone */}
          <div ref={scrollTrackRef} className="relative h-[250vh] w-full">

            {/* 3D Canvas wrapper - Sticky! Fica preso na tela enquanto o usuário rola os 250vh */}
            <div className="sticky top-0 h-screen w-full z-10 pointer-events-none overflow-hidden">
              <div className="absolute inset-0">
                <IPhoneCanvas scrollProgress={iphoneScrollProgress} />
              </div>
            </div>

            {/* Texto Hero - Absoluto no topo do track. Vai subir naturalmente com o scroll da página. */}
            <div className="absolute top-0 left-0 right-0 z-20 flex flex-col items-center px-6 text-center max-w-6xl mx-auto pt-24 pointer-events-auto">
              <FadeIn delay={0.1}>
                <div className="inline-flex items-center rounded-full border border-accent-blue/30 bg-accent-blue/10 px-3 py-1 text-sm font-medium text-accent-blue backdrop-blur-md">
                  <span className="flex h-2 w-2 rounded-full bg-accent-blue mr-2 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  {t("heroBadge")}
                  <span className="flex h-2 w-2 rounded-full bg-accent-blue ml-2 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                </div>
              </FadeIn>

              <FadeIn delay={0.2} className="mt-8">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-foreground via-foreground to-muted-foreground max-w-4xl mx-auto leading-[1.1]">
                  {t("heroTitle1")} <br className="hidden sm:block" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-blue to-accent-green">
                    {t("heroTitle2")}
                  </span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.3} className="mt-6">
                <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
                  {t("heroSubtitle")}
                </p>
              </FadeIn>

              <FadeIn delay={0.4} className="mt-10">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-accent-blue px-8 py-4 text-base font-semibold text-white transition-all hover:scale-105 hover:shadow-[0_0_24px_rgba(59,130,246,0.4)]"
                >
                  {t("cta")}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </FadeIn>
            </div>
          </div>

          {/* Features Section — Glassmorphism Bento Grid */}
          {/* Ambient orbs sit behind all cards so backdrop-blur has colour to refract */}
          <div className="relative px-6 pb-16 pt-24 max-w-5xl mx-auto">

            {/* Localized ambient orbs — give backdrop-filter colour to blur */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              {/* Blue orb — top-left, behind "Lançamento a Jato" */}
              <div className="absolute -top-20 -left-20 w-[520px] h-[420px] rounded-full bg-accent-blue/[0.13] blur-[100px]" />
              {/* Green orb — top-right, behind "Plano de Voo" */}
              <div className="absolute -top-10 right-0 w-[340px] h-[320px] rounded-full bg-accent-green/[0.11] blur-[90px]" />
              {/* Red orb — bottom-center, behind "Radar de Assinaturas" */}
              <div className="absolute bottom-0 left-1/4 w-[550px] h-[320px] rounded-full bg-accent-red/[0.10] blur-[110px]" />
            </div>


            <div className="relative">
              <FadeIn delay={0.1}>
                <h2 className="text-center text-3xl md:text-4xl font-bold text-foreground mb-12">
                  {t("featuresTitle")}
                </h2>
              </FadeIn>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">

                <FadeIn
                  delay={0.1}
                  className="liquid-glass-card md:col-span-2 rounded-[2rem] p-8"
                  style={{
                    "--glow-color": "rgba(59,130,246,0.30)",
                    "--glass-color": "rgba(59,130,246,0.08)",
                  } as React.CSSProperties}
                >
                  <div className="h-14 w-14 rounded-2xl bg-accent-blue/10 flex items-center justify-center border border-accent-blue/20 mb-6 shadow-[inset_0_1px_0_rgba(59,130,246,0.4)]">
                    <Zap className="h-7 w-7 text-accent-blue" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{t("feature1Title")}</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed text-lg">
                    {t("feature1Desc")}
                  </p>
                </FadeIn>

                <FadeIn
                  delay={0.2}
                  className="liquid-glass-card rounded-[2rem] p-8"
                  style={{
                    "--glow-color": "rgba(16,185,129,0.30)",
                    "--glass-color": "rgba(16,185,129,0.07)",
                  } as React.CSSProperties}
                >
                  <div className="h-14 w-14 rounded-2xl bg-accent-green/10 flex items-center justify-center border border-accent-green/20 mb-6 shadow-[inset_0_1px_0_rgba(16,185,129,0.4)]">
                    <PieChart className="h-7 w-7 text-accent-green" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{t("feature2Title")}</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {t("feature2Desc")}
                  </p>
                </FadeIn>

                <FadeIn
                  delay={0.3}
                  className="liquid-glass-card md:col-span-3 rounded-[2rem] p-8"
                  style={{
                    "--glow-color": "rgba(244,63,94,0.30)",
                    "--glass-color": "rgba(244,63,94,0.07)",
                  } as React.CSSProperties}
                >
                  <div className="md:flex md:items-center md:gap-12">
                    <div className="flex-1">
                      <div className="h-14 w-14 rounded-2xl bg-accent-red/10 flex items-center justify-center border border-accent-red/20 mb-6 shadow-[inset_0_1px_0_rgba(244,63,94,0.4)]">
                        <Target className="h-7 w-7 text-accent-red" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">{t("feature3Title")}</h3>
                      <p className="mt-3 text-muted-foreground leading-relaxed text-lg">
                        {t("feature3Desc")}
                      </p>
                    </div>
                    {/* Decorative side element */}
                    <div className="hidden md:flex flex-col gap-3 shrink-0">
                      {(isEn
                        ? ["Netflix · $15.99", "Spotify · $10.99", "iCloud · $2.99", "Gym · $30.00"]
                        : ["Netflix · R$ 55,90", "Spotify · R$ 21,90", "iCloud · R$ 12,90", "Academia · R$ 99,00"]
                      ).map((s, i) => (
                        <motion.div
                          key={s}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-3 rounded-xl bg-white/[0.05] border border-white/[0.08] px-4 py-3 text-sm"
                        >
                          <div className="w-2 h-2 rounded-full bg-accent-red" />
                          <span className="text-muted-foreground">{s}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}
