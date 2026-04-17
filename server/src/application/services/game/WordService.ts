import { Logger } from '../../../shared/utils/Logger';

const logger = Logger.getInstance();

export interface WordPair {
  citizenWord: string;
  spyWord: string;
}

export class WordService {
  private static instance: WordService;
  
  private wordBank: WordPair[] = [
    { citizenWord: 'Coffee', spyWord: 'Tea' },
    { citizenWord: 'Marvel', spyWord: 'DC' },
    { citizenWord: 'Pizza', spyWord: 'Burger' },
    { citizenWord: 'Apple', spyWord: 'Samsung' },
    { citizenWord: 'Discord', spyWord: 'Slack' },
    { citizenWord: 'Bitcoin', spyWord: 'Gold' },
    { citizenWord: 'SpaceX', spyWord: 'NASA' },
    { citizenWord: 'Laptop', spyWord: 'Tablet' },
    { citizenWord: 'Youtube', spyWord: 'Netflix' },
    { citizenWord: 'Cricket', spyWord: 'Baseball' },
    { citizenWord: 'Iron Man', spyWord: 'Batman' },
    { citizenWord: 'Tesla', spyWord: 'Ferrari' },
  ];

  private constructor() {}

  public static getInstance(): WordService {
    if (!WordService.instance) {
      WordService.instance = new WordService();
    }
    return WordService.instance;
  }

  public getRandomPair(): WordPair {
    const randomIndex = Math.floor(Math.random() * this.wordBank.length);
    const pair = this.wordBank[randomIndex];
    logger.debug(`🎲 [WordService] Selected pair: ${pair.citizenWord} / ${pair.spyWord}`);
    return pair;
  }
}
