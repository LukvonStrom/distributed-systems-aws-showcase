package database;


import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.DynamodbEvent;
import com.amazonaws.services.sns.AmazonSNS;
import com.amazonaws.services.sns.AmazonSNSClientBuilder;
import com.amazonaws.services.sns.model.PublishRequest;
import com.amazonaws.services.sns.model.PublishResult;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class DynamoDBHandler implements
        RequestHandler<DynamodbEvent, String> {

    final AmazonSNS snsClient = AmazonSNSClientBuilder.defaultClient();
    final String topicArn = System.getenv("TOPIC_ARN");
    ObjectMapper mapper = new ObjectMapper();

    String snsPayload = null;

    public String handleRequest(DynamodbEvent dynamodbEvent, Context context) {
        snsPayload = null;

        System.out.println("TOPIC ARN: " + topicArn);

        for (DynamodbEvent.DynamodbStreamRecord record : dynamodbEvent.getRecords()) {
            try {
                mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
                snsPayload = mapper.writeValueAsString(record.getDynamodb());
                System.out.println(snsPayload);
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }

            final PublishResult publishResponse = snsClient.publish(new PublishRequest(topicArn, snsPayload));
            System.out.println(publishResponse.toString());
        }

        return "Sent " + dynamodbEvent.getRecords().size() + "records to Amazon SNS.";
    }
}

