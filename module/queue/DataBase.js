
/**
 * @author FalaFreud Inc., Haroldo Shigueaki Teruya <haroldo.s.teruya@gmail.com>
 * @version 1.0.0
 */

//==========================================================================
// IMPORTS

/**
 * This class requires:
 * @class
 * @requires AsyncStorage
 */
 import { AsyncStorage } from 'react-native';

 //==========================================================================
 /**
  * @class
  * @classdesc
  */
class DataBase {

    //==========================================================================
    // METHODS

    get TAG() {
        return 'Queue DataBase';
    }

    async write(scheme, jobList) {
        try {
            await AsyncStorage.setItem(scheme, JSON.stringify(jobList));
            return true;
        } catch (e) {
            console.log(this.TAG, e);
            return false;
        }
    }

    async objects(scheme) {
        let jobs = [];
        try {
            jobs = await AsyncStorage.getItem(scheme);
            if (jobs) {
                jobs = JSON.parse(jobs);
            }
        } catch (e) {
            console.log(this.TAG, e);
        }
        return jobs;
    }

    async delete(scheme, job) {
        try {
            if (job) {
                const jobList = await this.objects(scheme);
                if (jobList && jobList.length > 0) {
                    const indexToRemove = jobList.indexOf(job);
                    jobList.splice(indexToRemove, 1);
                    return await this.create(scheme, jobList);
                }
            }
        } catch (e) {
            console.log(this.TAG, e);
        }
        return false;
    }

    async deleteAll(scheme) {        
        try {
            await AsyncStorage.removeItem(scheme);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}

//==========================================================================
// EXPORTS

/**
 * @module
 */
module.exports = new DataBase();
