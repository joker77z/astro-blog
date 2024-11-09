---
layout: ../../../layouts/MarkdownPostLayout.astro
pubDate: 2024-11-06
title: '[Next.js][App Router] 6. UI'
description: 'App Router'
tags: ["Next.js"]

---

## App Router UI 구현

Pages Router에서는 useRouter에서 query를 꺼냈던 것과는 다르게 App Router에서 queryString을 꺼내기 위해서 useSearchParams를 사용해야 한다.

```ts
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import style from "./serachbar.module.css";

export default function Searchbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");

  const q = searchParams.get("q");
```

