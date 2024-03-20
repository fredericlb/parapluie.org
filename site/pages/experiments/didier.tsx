"use client";

import Experiment from "@/app/experiment";
import dynamic from "next/dynamic";
import Layout from '@/app/layout';

const Exp01 = dynamic(() => import('exp-01-didier'), {
	ssr: false,
})

export default function () {
  return (
    <Layout>
      <Experiment height={"full"} name="Didier">
        <Exp01 />
      </Experiment>
    </Layout>
  )
}
