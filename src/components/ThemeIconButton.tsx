import { useEffect, useState } from "react";
import MoonSVG from "../assets/Moon";
import SunSVG from "../assets/Sun";
import Styles from "./ThemeIconButton.module.css";

export default function ThemeIconButton() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const $themeChangeBtn = document.querySelector("#themeChangeBtn");

    $themeChangeBtn?.addEventListener("click", () => {
      // dark가 없으면 추가하고 true, dark가 이미 있으면 제거하고 false
      const isDark = document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      if (isDark) {
        $themeChangeBtn?.classList.add("dark");
        setDarkMode(true);
      } else {
        $themeChangeBtn?.classList.remove("dark");
        setDarkMode(false);
      }
    });
  }, []);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const isDarkMode =
      theme === "dark" ||
      (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches);

    const $themeChangeBtn = document.querySelector("#themeChangeBtn");

    if (isDarkMode || darkMode) {
      document.documentElement.classList.add("dark");
    }
    if (isDarkMode) {
      $themeChangeBtn?.classList.add("dark");
      setDarkMode(true);
    } else {
      $themeChangeBtn?.classList.remove("dark");
      setDarkMode(false);
    }
  }, [darkMode]);

  return (
    <button id="themeChangeBtn" className={Styles["theme-change-btn"]}>
      {darkMode ? <MoonSVG /> : <SunSVG />}
    </button>
  );
}
