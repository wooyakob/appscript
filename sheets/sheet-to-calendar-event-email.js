// Customer:
// Auto Fill Google Calendar
// When new data entry is submitted, or once something goes under contract, all dates are automatically added onto peoples calendars.
// Any changes to contract dates that are made after submitting original dates, people will get a notification and a calendar update.

// Developer:
// This function is triggered when the contract date in the Google Sheet is changed. 
// It creates an event in Google Calendar and sends an email notification. 

function onEdit(e) {
    const sheet = e.source.getActiveSheet();
    const range = e.range;
  
    Logger.log("Edit triggered on sheet: " + sheet.getName());
  
    if (sheet.getName().toLowerCase() !== "sheet1") {
      Logger.log("Not the 'contracts' sheet. Exiting.");
      return;
    }
  
    const headerRow = 1;
    const editedRow = range.getRow();
    const editedCol = range.getColumn();
  
    const contractDateCol = 1;
    const addressCol = 2;
    const statusCol = 3;
    const eventIdCol = 4;
  
    Logger.log("Edited row: " + editedRow + ", column: " + editedCol);
  
    if (editedCol === eventIdCol) {
      Logger.log("Edit was in event ID column — skipping.");
      return;
    }
  
    if (editedRow <= headerRow) {
      Logger.log("Edit was in header row. Exiting.");
      return;
    }
  
    const contractDate = sheet.getRange(editedRow, contractDateCol).getValue();
    const address = sheet.getRange(editedRow, addressCol).getValue();
    const status = sheet.getRange(editedRow, statusCol).getValue();
    const eventIdCell = sheet.getRange(editedRow, eventIdCol);
    const existingEventId = eventIdCell.getValue();
  
    Logger.log("Row data → contractDate: " + contractDate + " | address: " + address + " | status: " + status);
  
    if (!status || status.toLowerCase().trim() !== "under contract") {
      Logger.log("Status is not 'under contract'. Exiting.");
      return;
    }
  
    if (!(contractDate instanceof Date)) {
      Logger.log("Contract date is not a valid date: " + contractDate);
      return;
    }
  
    const calendar = CalendarApp.getCalendarById("primary");
  
    if (existingEventId && existingEventId.toString().trim() !== "") {
      try {
        Logger.log("Trying to update existing event: " + existingEventId);
        const event = calendar.getEventById(existingEventId.trim());
        if (event) {
          event.setTitle("Contract: " + address);
          event.setTime(
            new Date(contractDate),
            new Date(contractDate.getTime() + 60 * 60 * 1000)
          );
          Logger.log("Event updated: " + existingEventId);
        } else {
          Logger.log("Event ID not found in calendar. Creating new one.");
          createNewEvent(calendar, address, contractDate, eventIdCell);
        }
      } catch (err) {
        Logger.log("Error updating event: " + err);
        Logger.log("Attempting to create a new event instead.");
        createNewEvent(calendar, address, contractDate, eventIdCell);
      }
    } else {
      Logger.log("No existing event ID. Creating new event.");
      createNewEvent(calendar, address, contractDate, eventIdCell);
    }
  }
  
  function createNewEvent(calendar, address, contractDate, eventIdCell) {
    try {
      const newEvent = calendar.createEvent(
        "Contract: " + address,
        new Date(contractDate),
        new Date(contractDate.getTime() + 60 * 60 * 1000)
      );
      const eventId = newEvent.getId();
      eventIdCell.setValue(eventId);
  
      const calendarLink = `https://calendar.google.com/calendar/u/0/r/eventedit/${encodeURIComponent(eventId)}`;
      const recipientEmail = "jacob@briotech.com";
      const subject = "New Contract Date Added to Calendar";
      const message = `
  A new contract date has been added to the calendar:
  
  📍 Address: ${address}
  📅 Date: ${contractDate.toDateString()}
  🗓️ This has been added to your calendar.
  
  Search for "Contract: ${address}" on ${contractDate.toDateString()} to view or edit it.
  `;
  
      MailApp.sendEmail(recipientEmail, subject, message);
      Logger.log("New event created and email sent: " + eventId);
    } catch (err) {
      Logger.log("Failed to create new event or send email: " + err);
    }
  }