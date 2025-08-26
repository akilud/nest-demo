import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';
import { Click } from '../entities/clicks.entity';

@Processor('click-processing')
@Injectable()
export class ClickProcessor extends WorkerHost {
  constructor(
    @InjectRepository(Click)
    private clickRepository: Repository<Click>,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { linkId, clickData } = job.data;
    
    console.log('Processing click job:', job.id);

    try {
      // Save click record to database
      const click = this.clickRepository.create({
        linkId: linkId,
        browser: clickData.browser || 'Unknown',
        ip: clickData.ip || 'Unknown',
        location: clickData.location || '',
      });

      const savedClick = await this.clickRepository.save(click);

    } catch (error) {
      console.error('processing failed:', error.message);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log('Job completed:', job.id);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    console.error('Job failed:', job.id, err.message);
  }
}
