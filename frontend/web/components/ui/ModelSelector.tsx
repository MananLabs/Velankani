import React from "react";
import Image from "next/image";
import styles from "./ModelSelector.module.css";

type ModelLogo = {
  name: string;
  logo: string;
  imageClassName?: string;
};

const models: ModelLogo[] = [
  { name: "GPT", logo: "/logos/gpt.png" },
  { name: "Claude", logo: "/logos/claude.png" },
  { name: "Gemini", logo: "/logos/gemini.png" },
  { name: "Qwen", logo: "/logos/qwen.png", imageClassName: styles.qwenLogo },
  { name: "Kimi", logo: "/logos/kimi.png" },
];

export default function ModelSelector() {
  return (
    <div className={styles.selectorRoot}>
      <div className={styles.modeLabel}>AUTO</div>
      <div className={styles.modelOptions}>
        {models.map((model) => (
          <div className={styles.modelBox} key={model.name}>
            <Image
              src={model.logo}
              alt={model.name}
              width={32}
              height={32}
              className={`${styles.logoImage} ${model.imageClassName ?? ""}`.trim()}
            />
          </div>
        ))}
      </div>
      <div className={styles.modeLabel}>MANUAL</div>
      {/* TODO: Add animated lines here */}
    </div>
  );
}
