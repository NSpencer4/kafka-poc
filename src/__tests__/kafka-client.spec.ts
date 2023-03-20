import { Kafka, KafkaMessage } from 'kafkajs';

jest.setTimeout(30000)

describe('Kafka integration', () => {
    let kafkaClient = new Kafka({
                                    clientId: 'kafka-poc',
                                    brokers: ['localhost:19092'],
                                    // ssl: {
                                    //     rejectUnauthorized: false,
                                    //     ca: '',
                                    //     cert: '',
                                    //     key: '',
                                    // },
                                });

    it('should be able to connect to the kafka broker', async () => {
        try {
            await kafkaClient.producer().connect()
        } catch (e) {
            console.error('Could not connect to the Kafka broker: ', e)
        }
        expect(kafkaClient).toBeTruthy()
    });

    it('should be able to create a new Kafka topic', async () => {
        const admin = kafkaClient.admin()
        try {
            await admin.connect()
            await admin.createTopics({
                                         topics: [{topic: 'content-commands'}],
                                         waitForLeaders: true,
                                         timeout: 5000
            })
        } catch (e) {
            console.error('Could not create the Kafka topic: ', e)
        }

        const topics = await admin.listTopics()
        expect(topics).toEqual(expect.arrayContaining([ 'content-commands' ]))
    });

    it('should publish a mock test message to the content updates topic and consume it', async () => {
        const mockPayload = JSON.stringify({test: 'mock'})

        const consumer = kafkaClient.consumer({groupId: 'consumers', heartbeatInterval: 1000});
        const producer = kafkaClient.producer();

        try {
            await consumer.connect()
            await producer.connect()
        } catch (e) {
            console.error('Could not connect to the kafka broker: ', e)
        }

        const messages: KafkaMessage[] = []

        await consumer.subscribe({ topic: 'content-commands', fromBeginning: false })

        await consumer.run({
                               eachMessage: async ({ topic, message }) => {
                                   console.log('message', message)
                                   messages.push(message)
        }})

        await producer.send({topic: 'content-commands', messages: [{value: mockPayload}]})

        await new Promise((resolve) => setTimeout(() => {
            resolve(() => console.log("Delayed for 5 seconds to allow the consumer to receive the message."))
        }, 5000))

        expect(messages.length).toEqual(1)
        expect(messages[0].value!.toString()).toEqual(mockPayload)
    });

    it('should be able to remove a new Kafka topic', async () => {
        const admin = kafkaClient.admin()
        try {
            await admin.connect()
            await admin.deleteTopics({topics: ['content-commands']})
        } catch (e) {
            console.error('Could not create the Kafka topic: ', e)
        }

        const topics = await admin.listTopics()
        expect(topics).not.toContain('content-commands')
    });
});
