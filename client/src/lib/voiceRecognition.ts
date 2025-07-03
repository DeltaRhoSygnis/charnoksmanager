// Voice recognition utility using Web Speech API
export interface VoiceTransactionData {
  products: Array<{
    name: string;
    quantity: number;
  }>;
  amountPaid: number;
  rawText: string;
}

export class VoiceRecognition {
  private recognition: any = null;
  private isSupported = false;

  constructor() {
    this.checkSupport();
  }

  private checkSupport(): boolean {
    if (typeof window !== "undefined") {
      // Check for browser support
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.setupRecognition();
        this.isSupported = true;
      }
    }
    return this.isSupported;
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = "en-US"; // You can change this to support other languages
    this.recognition.maxAlternatives = 1;
  }

  public isVoiceSupported(): boolean {
    return this.isSupported;
  }

  public startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported || !this.recognition) {
        reject(new Error("Voice recognition not supported"));
        return;
      }

      this.recognition.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        resolve(result);
      };

      this.recognition.onerror = (event: any) => {
        reject(new Error(`Voice recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        // Recognition ended
      };

      try {
        this.recognition.start();
      } catch (error) {
        reject(error);
      }
    });
  }

  public stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  // Parse voice input like "2 Coke and 1 Piattos, 100 pesos"
  public parseVoiceInput(text: string): VoiceTransactionData {
    const normalizedText = text.toLowerCase().trim();

    // Extract amount paid (look for numbers followed by "pesos", "peso", or currency symbols)
    const amountRegex = /(\d+(?:\.\d{1,2})?)\s*(?:pesos?|php|₱|p\b)/i;
    const amountMatch = normalizedText.match(amountRegex);
    const amountPaid = amountMatch ? parseFloat(amountMatch[1]) : 0;

    // Extract products and quantities
    const products: Array<{ name: string; quantity: number }> = [];

    // Split by common separators (and, comma, plus)
    const segments = normalizedText
      .replace(/,?\s*(\d+(?:\.\d{1,2})?)\s*(?:pesos?|php|₱|p\b).*$/i, "") // Remove amount from end
      .split(/\s+(?:and|,|\+)\s+/);

    segments.forEach((segment) => {
      // Look for pattern: number + product name
      const productMatch = segment.match(/(\d+)\s+(.+)/);
      if (productMatch) {
        const quantity = parseInt(productMatch[1]);
        let productName = productMatch[2].trim();

        // Clean up common variations
        productName = this.normalizeProductName(productName);

        if (quantity > 0 && productName) {
          products.push({
            name: productName,
            quantity,
          });
        }
      }
    });

    return {
      products,
      amountPaid,
      rawText: text,
    };
  }

  private normalizeProductName(name: string): string {
    // Common product name normalizations
    const normalizations: { [key: string]: string } = {
      coke: "Coca Cola",
      "coca cola": "Coca Cola",
      pepsi: "Pepsi",
      sprite: "Sprite",
      piattos: "Piattos",
      chips: "Chips",
      water: "Water",
      "bottle water": "Bottled Water",
      "bottled water": "Bottled Water",
      juice: "Juice",
      biscuit: "Biscuit",
      biscuits: "Biscuit",
      candy: "Candy",
      candies: "Candy",
      chocolate: "Chocolate",
      gum: "Gum",
      crackers: "Crackers",
      nuts: "Nuts",
      coffee: "Coffee",
      tea: "Tea",
    };

    const normalized = name.toLowerCase().trim();
    return normalizations[normalized] || this.capitalizeWords(name);
  }

  private capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, (l) => l.toUpperCase());
  }

  // Match voice input products with database products
  public matchProductsWithDatabase(
    voiceProducts: Array<{ name: string; quantity: number }>,
    databaseProducts: Array<{ id: string; name: string; price: number }>,
  ): Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
    matched: boolean;
  }> {
    return voiceProducts.map((voiceProduct) => {
      // Try to find exact match first
      let dbProduct = databaseProducts.find(
        (db) => db.name.toLowerCase() === voiceProduct.name.toLowerCase(),
      );

      // If no exact match, try partial match
      if (!dbProduct) {
        dbProduct = databaseProducts.find(
          (db) =>
            db.name.toLowerCase().includes(voiceProduct.name.toLowerCase()) ||
            voiceProduct.name.toLowerCase().includes(db.name.toLowerCase()),
        );
      }

      if (dbProduct) {
        const total = dbProduct.price * voiceProduct.quantity;
        return {
          id: dbProduct.id,
          name: dbProduct.name,
          quantity: voiceProduct.quantity,
          price: dbProduct.price,
          total,
          matched: true,
        };
      }

      // No match found
      return {
        id: "",
        name: voiceProduct.name,
        quantity: voiceProduct.quantity,
        price: 0,
        total: 0,
        matched: false,
      };
    });
  }
}

// Export singleton instance
export const voiceRecognition = new VoiceRecognition();
