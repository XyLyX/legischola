import { organizationSchema, softwareSchema } from "../lib/seo-schema";

export default function StructuredData() {
  const schemas = [organizationSchema(), softwareSchema()];
  return (
    <>
      {schemas.map((schema) => (
        <script
          key={schema["@id"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
        />
      ))}
    </>
  );
}
