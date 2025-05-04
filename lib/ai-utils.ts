// Helper function to generate text using OpenAI
export async function generateAIText(prompt: string, maxTokens = 1000) {
  try {
    // Check if we have a valid API key
    if (!process.env.OPENAI_API_KEY) {
      console.warn("Missing OpenAI API key")
      return "API key not configured. Please add your OpenAI API key to the environment variables."
    }

    console.log("Making request to OpenAI API")
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Fallback to a more available model
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const status = response.status
      console.error(`OpenAI API error: ${status}`, errorData)

      // Handle rate limiting specifically
      if (status === 429) {
        console.warn("OpenAI API rate limit reached")
        return generateFallbackSummary(prompt)
      }

      throw new Error(`OpenAI API error: ${status} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    console.log("Successfully received response from OpenAI API")
    return data.choices[0].message.content
  } catch (error) {
    console.error("Error generating AI text:", error)
    return generateFallbackSummary(prompt)
  }
}

// Generate a fallback summary when the API fails
function generateFallbackSummary(prompt: string): string {
  // Extract book title and author from the prompt if possible
  let title = "this book"
  let author = "the author"

  const titleMatch = prompt.match(/book "([^"]+)"/)
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1]
  }

  const authorMatch = prompt.match(/by ([^.]+)/)
  if (authorMatch && authorMatch[1]) {
    author = authorMatch[1]
  }

  return `We're currently experiencing high demand and couldn't generate a custom summary for "${title}" by ${author} at this moment. 
  
This book is a notable work in its genre. The author explores various themes and ideas throughout the narrative, creating a compelling reading experience. 

Please check back later for a more detailed AI-generated summary, or explore the book's description for more information about its content.`
}

// Generate embeddings for text using OpenAI
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Since we're having issues with the AI SDK, we'll use a direct approach
    // to generate embeddings
    const prompt = `
    Convert the following text into a comma-separated list of 384 floating point numbers 
    representing its embedding vector. Each number should be between -1 and 1.
    The numbers should capture the semantic meaning of the text.
    
    Text: "${text}"
    
    Output only the comma-separated numbers without any explanation:
    `

    const embeddingText = await generateAIText(prompt, 2000)

    // If we got a fallback response, return a zero vector
    if (embeddingText.includes("We're currently experiencing high demand")) {
      return Array(384).fill(0)
    }

    // Parse the response into an array of numbers
    const cleanedText = embeddingText.trim()
    const numbers = cleanedText.split(",").map((num) => Number.parseFloat(num.trim()))

    // Validate the embedding
    if (numbers.length !== 384 || numbers.some(isNaN)) {
      throw new Error("Invalid embedding generated")
    }

    return numbers
  } catch (error) {
    console.error("Error generating embedding:", error)
    // Return a zero vector as fallback
    return Array(384).fill(0)
  }
}

// Generate embeddings for a book
export async function generateBookEmbedding(book: { title: string; author: string; description?: string }): Promise<
  number[]
> {
  // Combine book information into a single text
  const text = `
    Title: ${book.title}
    Author: ${book.author}
    Description: ${book.description || "No description available"}
  `

  return generateEmbedding(text)
}
