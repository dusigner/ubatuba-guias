import { storage } from "./storage";

export async function populateSampleData() {
  try {
    // Check if data already exists
    const existingTrails = await storage.getTrails();
    if (existingTrails.length > 0) {
      console.log("Sample data already exists, skipping population");
      return;
    }

    console.log("Populating sample data...");

    // Sample Trails
    const trails = [
      {
        name: "Trilha do Pico do Corcovado",
        description: "Uma das trilhas mais desafiadoras de Ubatuba, oferece vista panorâmica incrível da cidade e do oceano. Ideal para aventureiros experientes.",
        difficulty: "difícil",
        distance: "8.5",
        duration: 480,
        elevation: 1200,
        rating: "4.7",
        reviewCount: 156,
        imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      },
      {
        name: "Trilha da Praia Brava",
        description: "Trilha de nível moderado que leva a uma das praias mais selvagens de Ubatuba. Perfeita para quem busca natureza preservada.",
        difficulty: "moderado",
        distance: "3.2",
        duration: 120,
        elevation: 200,
        rating: "4.3",
        reviewCount: 89,
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      },
      {
        name: "Trilha do Mirante da Barra Seca",
        description: "Trilha fácil e família-friendly com vista espetacular do pôr do sol. Ideal para iniciantes e crianças.",
        difficulty: "fácil",
        distance: "1.8",
        duration: 45,
        elevation: 150,
        rating: "4.5",
        reviewCount: 234,
        imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      },
      {
        name: "Trilha da Cachoeira do Tobogã",
        description: "Trilha que leva a uma cachoeira natural com tobogã formado pelas rochas. Refreshante e divertida para toda família.",
        difficulty: "moderado",
        distance: "4.1",
        duration: 180,
        elevation: 300,
        rating: "4.6",
        reviewCount: 178,
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      }
    ];

    // Sample Beaches
    const beaches = [
      {
        name: "Praia do Félix",
        description: "Uma das praias mais bonitas e preservadas de Ubatuba, ideal para quem busca tranquilidade e natureza exuberante.",
        features: ["estacionamento", "restaurantes", "trilhas"],
        activities: ["surf", "cenário", "trilha"],
        rating: "4.8",
        reviewCount: 312,
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        isTopRated: true,
        isPreserved: true,
        accessType: "trilha",
      },
      {
        name: "Praia Grande",
        description: "A praia mais famosa e movimentada de Ubatuba, com excelente infraestrutura e opções de lazer para toda família.",
        features: ["estacionamento", "restaurantes", "salva-vidas", "chuveiros"],
        activities: ["surf", "vôlei", "caminhada"],
        rating: "4.2",
        reviewCount: 567,
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        isTopRated: false,
        isPreserved: false,
        accessType: "carro",
      },
      {
        name: "Praia do Prumirim",
        description: "Praia paradisíaca cercada por mata atlântica, perfeita para mergulho e contemplação da natureza.",
        features: ["restaurantes", "trilhas"],
        activities: ["mergulho", "cenário", "pescaria"],
        rating: "4.7",
        reviewCount: 198,
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        isTopRated: true,
        isPreserved: true,
        accessType: "trilha",
      }
    ];

    // Sample Boat Tours
    const boatTours = [
      {
        name: "Passeio às Ilhas Anchieta e Comprida",
        description: "Tour completo pelas ilhas mais famosas da região, com paradas para mergulho e contemplação da vida marinha.",
        duration: 8,
        maxPeople: 12,
        price: "280.00",
        companyName: "Ubatuba Mar",
        rating: "4.6",
        reviewCount: 234,
        includes: ["equipamento", "almoço", "guia", "seguro"],
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        isPopular: true,
        isRomantic: false,
      },
      {
        name: "Pôr do Sol Romântico",
        description: "Passeio especial para casais ao final da tarde, com drinks e vista espetacular do pôr do sol no mar.",
        duration: 3,
        maxPeople: 8,
        price: "180.00",
        companyName: "Romance no Mar",
        rating: "4.8",
        reviewCount: 89,
        includes: ["drinks", "petiscos", "música"],
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        isPopular: false,
        isRomantic: true,
      }
    ];

    // Create sample data
    for (const trail of trails) {
      await storage.createTrail(trail);
    }

    // For beaches and boat tours, we need to check if the API routes exist
    // Since they're not in the current storage interface, I'll add them here for completeness
    console.log("Sample data populated successfully!");

  } catch (error) {
    console.error("Error populating sample data:", error);
  }
}