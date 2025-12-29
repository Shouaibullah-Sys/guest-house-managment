import React from "react";
import { motion } from "framer-motion";

type Props = {
  data: any;
  uniqueKey?: string;
};

function OtherInfo({ data, uniqueKey }: Props) {
  const key = uniqueKey || data?.title || "default";

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className=" flex flex-col"
    >
      <motion.p
        className=" spacing overflow-hidden text-[#D5D5D6] mb-2"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        key={`${key}-location`}
      >
        {data?.location}
      </motion.p>
      <motion.h1
        className=" my-1 text-4xl font-semibold md:my-3 md:text-8xl md:leading-[100px]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        key={`${key}-title`}
      >
        {data?.title}
      </motion.h1>
      <motion.p
        className=" text-xs text-[#D5D5D6]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        key={`${key}-description`}
      >
        {data?.description}
      </motion.p>
    </motion.div>
  );
}

export default OtherInfo;
