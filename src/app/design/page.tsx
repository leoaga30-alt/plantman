import { Button } from "@/components/ui/button";

const colors = [
  { name: "primary", hex: "#2d6a4f", label: "Sage Green" },
  { name: "accent", hex: "#52b788", label: "Light Green" },
  { name: "sage", hex: "#74b894", label: "Soft Sage" },
  { name: "cream", hex: "#f4f1de", label: "Cream" },
  { name: "pale-green", hex: "#f1f8f6", label: "Pale Green" },
  { name: "hairline", hex: "#e5e3df", label: "Hairline" },
  { name: "ink", hex: "#1a1a1a", label: "Ink" },
  { name: "muted", hex: "#bbb8b1", label: "Muted" },
];

export default function DesignPage() {
  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-foreground">
          Arrosoir Design System
        </h1>
        <p className="text-muted-foreground mb-12">
          Calm, plant-centric interface with sage green accents and warm typography.
        </p>

        {/* Palette */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">
            Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {colors.map((color) => (
              <div key={color.name} className="space-y-2">
                <div
                  className="w-full h-24 rounded-lg border shadow-sm"
                  style={{ backgroundColor: color.hex }}
                />
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {color.label}
                  </p>
                  <code className="text-xs text-muted-foreground">
                    {color.hex}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">
            Typography
          </h2>
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl font-bold mb-2">Display Large</h1>
              <p className="text-sm text-muted-foreground">56px, Weight 600</p>
            </div>
            <div>
              <h2 className="text-3xl font-semibold mb-2">Heading 2</h2>
              <p className="text-sm text-muted-foreground">36px, Weight 600</p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">Heading 3</h3>
              <p className="text-sm text-muted-foreground">24px, Weight 600</p>
            </div>
            <div>
              <p className="text-base mb-2">Body text (16px)</p>
              <p className="text-sm text-muted-foreground">Regular</p>
            </div>
            <div>
              <p className="text-xs mb-2">Small text (12px)</p>
              <p className="text-xs text-muted-foreground">Regular</p>
            </div>
          </div>
        </section>

        {/* Components */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">
            Components
          </h2>

          <div className="space-y-8">
            {/* Buttons */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Buttons
              </h3>
              <div className="flex flex-wrap gap-4">
                <Button>Default Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>

            {/* Cards */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Cards
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 border rounded-lg bg-card shadow-sm">
                  <h4 className="font-semibold mb-2">Default Card</h4>
                  <p className="text-sm text-muted-foreground">
                    This is a default card with border and shadow.
                  </p>
                </div>
                <div
                  className="p-6 rounded-lg shadow-sm"
                  style={{ backgroundColor: "#f1f8f6" }}
                >
                  <h4 className="font-semibold mb-2">Pale Green Card</h4>
                  <p className="text-sm text-muted-foreground">
                    Soft background for secondary content.
                  </p>
                </div>
                <div
                  className="p-6 rounded-lg shadow-sm"
                  style={{ backgroundColor: "#f4f1de" }}
                >
                  <h4 className="font-semibold mb-2">Cream Card</h4>
                  <p className="text-sm text-muted-foreground">
                    Warm background for highlighted sections.
                  </p>
                </div>
                <div
                  className="p-6 rounded-lg shadow-sm"
                  style={{ backgroundColor: "#e8f5e9" }}
                >
                  <h4 className="font-semibold mb-2">Sage Card</h4>
                  <p className="text-sm text-muted-foreground">
                    Plant-themed background.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Form Fields
              </h3>
              <div className="space-y-4 max-w-sm">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Input Field
                  </label>
                  <input
                    type="text"
                    placeholder="Enter text…"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Design system version alpha • Based on Notion design patterns, adapted for household plant care
          </p>
        </section>
      </div>
    </div>
  );
}
