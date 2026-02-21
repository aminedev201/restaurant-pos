const SvgPreview = ({ svg, className = 'w-5 h-5' }) => {
  if (!svg) return null;
  return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
};

export default SvgPreview;