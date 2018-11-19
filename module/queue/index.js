/**
 * @author FaalFreud Inc., Haroldo Shigueaki Teruya <haroldo.s.teruya@gmail.com>
 * @version 1.0.0
 */

//==========================================================================
// IMPORTS

import Database from '../DataBaseController';
import uuid from 'react-native-uuid';
import promiseReflect from 'promise-reflect';

/**
 * This class requires:
 * @class
 * @requires NativeModules from react-native
 */
import { NativeModules } from 'react-native';

//==========================================================================
/**
 * @class
 * @classdesc
 */
class QueueManager {

    /**
     * Creates a instance of QueueManager.
     */
    constructor() {
    }

    //==========================================================================
    // METHODS

    get TAG() {
        return 'Queue Manager';
    }

    get Status() {
        return {
            INACTIVE: 0,
            ACTIVE: 1
        };
    }

    constructor() {
        this.realm = null;
        this.status = this.Status.INACTIVE;
        this.worker = null;
        this.jobList = [];
    }

    async init() {
        if (this.realm === null) {            
            this.realm = Database;
            this.jobList = await this.realm.objects('Job');
        }
    }

    setCallback(callback) {
        this.worker = callback;
    }

    async createJob(payload, autoStart = false) {
        console.log(this.TAG, 'createJob autoStart:', autoStart);
        this.jobList.push(payload);
        const success = await this.realm.write('Job', this.jobList);

        // console.log(this.TAG, 'createJob success:', success, this.jobList);

        if (success && this.status === this.Status.INACTIVE && autoStart) {
            await this.start();
        }
    }

    async start() {
        console.log(this.TAG, 'start...', this.status ? 'active' : 'inactive');

        if (this.status === this.Status.ACTIVE) {
            return;
        }

        this.status = this.Status.ACTIVE;


        while (this.status === this.Status.ACTIVE && this.jobList.length) {

            console.log(this.TAG,
                'runnable:', this.status === this.Status.ACTIVE,
                'jobList length:', this.jobList.length
            );

            let job = await this.getNextJob();

            if (job) {
                const success = await this.worker(job);
                console.log(this.TAG, 'worked:', success);

                if (success) {
                    await this.flushJob(job);
                } else {
                    this.setJobInactive(job);
                }
            } else {
                this.status = this.Status.INACTIVE;
                return;
            }
        }

        this.status = this.Status.INACTIVE;
    }

     getNextJob() {
        for(let i = 0; i < this.jobList.length; i++) {
            if (this.jobList[i].active) {
                return this.jobList[i];
            }
        }
        return null;
    }

    stop() {
        this.status = this.Status.INACTIVE;
    }

    getJobs() {
        return this.jobList;
    }

    async setJobInactive(job) {
        const index = this.jobList.indexOf(job);
        this.jobList[index] = {
            ...this.jobList[index],
            active: false
        };
        return await this.realm.write('Job', this.jobList);
    }

    async flushJob(job) {
        const indexToRemove = this.jobList.indexOf(job);
        this.jobList.splice(indexToRemove, 1);
        return await this.realm.write('Job', this.jobList);
    }

    async flushQueue() {
        this.jobList = [];
        return await this.realm.deleteAll('Job');
    }
}

//==========================================================================
// EXPORTS

/**
 * @module
 */
module.exports = new QueueManager();
